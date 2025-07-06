import { firestore } from "@cb/db";
import {
  addDoc,
  arrayUnion,
  collection,
  CollectionReference,
  doc,
  DocumentReference,
  FirestoreDataConverter,
  getDoc,
  onSnapshot,
  SnapshotOptions,
  updateDoc,
} from "firebase/firestore";
import {
  Connection,
  Database,
  DatabaseObserver,
  Model,
  ObserverCollectionCallback,
  ObserverDocumentCallback,
  Room,
} from "..";
import { connectionCoverter, roomConverter } from "./converter";

type FirebaseTypes = {
  [Model.ROOMS]: Room;
  [Model.CONNECTIONS]: Connection;
};

const SNAPSHOT_OPTIONS: SnapshotOptions = { serverTimestamps: "estimate" };

const firebaseConverters: {
  [K in keyof FirebaseTypes]: FirestoreDataConverter<FirebaseTypes[K]>;
} = {
  [Model.ROOMS]: roomConverter,
  [Model.CONNECTIONS]: connectionCoverter,
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
  ref: CollectionReference<T>,
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
  doc(firestore, Model.ROOMS, id).withConverter(
    firebaseConverters[Model.ROOMS]
  );

const getRoomRefs = () =>
  collection(firestore, Model.ROOMS).withConverter(roomConverter);

const getPeerConnectionRef = (id: string, from: string, to: string) =>
  doc(getRoomRef(id), from, to).withConverter(
    firebaseConverters[Model.CONNECTIONS]
  );

const firebaseListenerImpl: DatabaseObserver = {
  subscribeToRoom(id, cb) {
    return withDocumentSnapshot(getRoomRef(id), cb);
  },

  subscribeToRooms(cb) {
    return withCollectionSnapshot(getRoomRefs(), cb);
  },

  subscribeToConnection(id, from, to, cb) {
    return withDocumentSnapshot(getPeerConnectionRef(id, from, to), cb);
  },
};

export const firebaseDatabaseImpl: Database = {
  createRoom(room) {
    return addDoc(getRoomRefs(), room).then((ref) => ref.id);
  },

  getRoom(id) {
    return getDoc(getRoomRef(id)).then((room) => room.data(SNAPSHOT_OPTIONS));
  },

  setRoom(id, room) {
    return updateDoc(getRoomRef(id), {
      ...room,
      usernames: arrayUnion(...(room.usernames ?? [])),
    });
  },

  listener() {
    return firebaseListenerImpl;
  },
};
