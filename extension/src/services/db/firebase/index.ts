import {
  DatabaseService,
  Models,
  Negotiation,
  ObserverCollectionCallback,
  ObserverDocumentCallback,
  Room,
  UserProgress,
} from "@cb/types";
import {
  addDoc,
  arrayUnion,
  collection,
  deleteField,
  doc,
  DocumentReference,
  FieldPath,
  FirestoreDataConverter,
  getDoc,
  increment,
  onSnapshot,
  Query,
  query,
  serverTimestamp,
  setDoc,
  SnapshotOptions,
  updateDoc,
  where,
} from "firebase/firestore";
import {
  negotiationConverter,
  roomConverter,
  userProgressConverter,
} from "./converter";
import { auth, firestore } from "./setup";
export { auth };

type FirebaseTypes = {
  [Models.ROOMS]: Room;
  [Models.NEGOTIATIONS]: Negotiation;
  [Models.USER_PROGRESS]: UserProgress;
};

const SNAPSHOT_OPTIONS: SnapshotOptions = {
  serverTimestamps: "estimate",
};

const firebaseConverters: {
  [K in keyof FirebaseTypes]: FirestoreDataConverter<FirebaseTypes[K]>;
} = {
  [Models.ROOMS]: roomConverter,
  [Models.NEGOTIATIONS]: negotiationConverter,
  [Models.USER_PROGRESS]: userProgressConverter,
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

const getUserRef = (roomId: string, username: string) =>
  doc(
    firestore,
    Models.ROOMS,
    roomId,
    Models.USER_PROGRESS,
    username
  ).withConverter(firebaseConverters[Models.USER_PROGRESS]);

export const firebaseDatabaseServiceImpl: DatabaseService = {
  room: {
    async create(room) {
      const doc = { ...room, users: {}, version: 0 };
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
        {
          users: { [user]: { joinedAt: serverTimestamp() } },
          version: increment(1),
        },
        { merge: true }
      );
    },

    addQuestion(id, question) {
      return setDoc(
        getRoomRef(id),
        { questions: arrayUnion(question) },
        { merge: true }
      );
    },

    async removeUser(id, user) {
      await updateDoc(
        getRoomRef(id),
        new FieldPath("users", user),
        deleteField(),
        "version",
        increment(1)
      );
      return Promise.resolve();
    },

    async addNegotiation(id, data) {
      await addDoc(getNegotiationRefs(id), data);
      return Promise.resolve();
    },

    getUserProgress(roomId, username) {
      return getDoc(getUserRef(roomId, username)).then((user) =>
        user.data(SNAPSHOT_OPTIONS)
      );
    },

    setUserProgress(roomId, username, progress) {
      return setDoc(getUserRef(roomId, username), progress, { merge: true });
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
