import {
  DatabaseService,
  Models,
  Negotiation,
  ObserverCollectionCallback,
  ObserverDocumentCallback,
  Room,
} from "@cb/types";
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  DocumentReference,
  FirestoreDataConverter,
  getDoc,
  increment,
  onSnapshot,
  Query,
  query,
  setDoc,
  SnapshotOptions,
  where,
} from "firebase/firestore";
import { negotiationConverter, roomConverter } from "./converter";
import { auth, firestore } from "./setup";
export { auth };

type FirebaseTypes = {
  [Models.ROOMS]: Room;
  [Models.NEGOTIATIONS]: Negotiation;
};

const SNAPSHOT_OPTIONS: SnapshotOptions = {
  serverTimestamps: "estimate",
};

const firebaseConverters: {
  [K in keyof FirebaseTypes]: FirestoreDataConverter<FirebaseTypes[K]>;
} = {
  [Models.ROOMS]: roomConverter,
  [Models.NEGOTIATIONS]: negotiationConverter,
};

const withDocumentSnapshot = <T>(
  ref: DocumentReference<T>,
  cb: ObserverDocumentCallback<T>
) => {
  return onSnapshot(ref, (snap) => {
    const data = snap.data(SNAPSHOT_OPTIONS);
    if (data != undefined) {
      cb.onChange(data);
    } else {
      cb.onNotFound?.();
    }
  });
};

const withCollectionSnapshot = <T>(
  ref: Query<T>,
  cb: ObserverCollectionCallback<T>
) => {
  return onSnapshot(ref, (snap) => {
    snap.docChanges().forEach((change) => {
      const data = change.doc.data(SNAPSHOT_OPTIONS);
      switch (change.type) {
        case "added":
          cb.onAdded(data);
          break;
        case "modified":
          cb.onModified(data);
          break;
        case "removed":
          cb.onDeleted(data);
          break;
        default:
          assertUnreachable(change.type);
      }
    });
  });
};

const getRoomRef = (id: string) =>
  doc(firestore, Models.ROOMS, id).withConverter(
    firebaseConverters[Models.ROOMS]
  );

const getRoomRefs = () =>
  collection(firestore, Models.ROOMS).withConverter(roomConverter);

const getNegotiationRefs = (id: string) =>
  collection(getRoomRef(id), Models.NEGOTIATIONS).withConverter(
    firebaseConverters[Models.NEGOTIATIONS]
  );

export const firebaseDatabaseServiceImpl: DatabaseService = {
  room: {
    async create(room) {
      const doc = { ...room, usernames: [], version: 0 };
      const ref = await addDoc(getRoomRefs(), doc);
      return {
        id: ref.id,
        ...doc,
      };
    },

    get(id) {
      return getDoc(getRoomRef(id)).then((room) => room.data(SNAPSHOT_OPTIONS));
    },

    addUser(id, user) {
      return setDoc(
        getRoomRef(id),
        { usernames: arrayUnion(user), version: increment(1) },
        { merge: true }
      );
    },

    removeUser(id, user) {
      return setDoc(
        getRoomRef(id),
        { usernames: arrayRemove(user), version: increment(1) },
        { merge: true }
      );
    },

    async addNegotiation(id, data) {
      await addDoc(getNegotiationRefs(id), data);
      return Promise.resolve();
    },

    observer: {
      room(id, cb) {
        return withDocumentSnapshot(getRoomRef(id), cb);
      },

      negotiations(id, version, cb) {
        console.log("Listening for version", version);
        return withCollectionSnapshot(
          query(getNegotiationRefs(id), where("version", ">", version)),
          cb
        );
      },
    },
  },
};
