import { firestore } from "@cb/db";
import {
  DatabaseService,
  Models,
  Negotiation,
  ObserverCollectionCallback,
  ObserverDocumentCallback,
  Room,
} from "@cb/services/db/types";
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
    create(room) {
      return addDoc(getRoomRefs(), { ...room, version: 0 }).then(
        (ref) => ref.id
      );
    },

    get(id) {
      return getDoc(getRoomRef(id)).then((room) => room.data(SNAPSHOT_OPTIONS));
    },

    addUser(id, user) {
      return setDoc(
        getRoomRef(id),
        { usernames: arrayUnion(user) },
        { merge: true }
      );
    },

    removeUser(id, user) {
      return setDoc(
        getRoomRef(id),
        { usernames: arrayRemove(user) },
        { merge: true }
      );
    },

    incrementVersion(id) {
      return setDoc(getRoomRef(id), { version: increment(1) }, { merge: true });
    },

    observer: {
      room(id, cb) {
        return withDocumentSnapshot(getRoomRef(id), cb);
      },

      negotiations(id, version, cb) {
        return withCollectionSnapshot(
          query(getNegotiationRefs(id), where("version", ">", version)),
          cb
        );
      },
    },
  },
};
