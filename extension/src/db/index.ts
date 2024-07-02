import { initializeApp } from "firebase/app";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  setDoc,
} from "firebase/firestore";
import { config } from "@cb/db/config";
import { peerConnectionConverter, roomConverter } from "@cb/db/converter";

const app = initializeApp(config);
const firestore = getFirestore(app);

const entry = () => {
  const rooms = () => {
    const roomRef = doc(collection(firestore, "rooms")).withConverter(
      roomConverter
    );
    return {
      ref: () => roomRef,
      doc: (roomId: string) => room(roomId),
    };
  };

  const room = (id: string) => {
    const ref = doc(firestore, "rooms", id).withConverter(roomConverter);
    return {
      ref: () => ref,
      doc: () => getDoc(ref),
    };
  };

  const usernamesCollection = (roomId: string) => {
    const roomRef = room(roomId).ref();
    const usernamesCollection = collection(
      firestore,
      roomRef.path,
      "usernames"
    );
    return {
      ref: () => usernamesCollection,
      doc: async () => await getDocs(usernamesCollection),
      addUser: (username: string) => addUsername(roomId, username),
    };
  };

  const addUsername = async (roomId: string, username: string) => {
    const usernamesCollectionRef = usernamesCollection(roomId).ref();
    const userDocRef = doc(usernamesCollectionRef, username);
    await setDoc(userDocRef, {});
  };

  const connections = (roomId: string, username: string) => {
    const roomRef = room(roomId).ref();
    const userCollection = collection(
      firestore,
      roomRef.path,
      username
    ).withConverter(peerConnectionConverter);
    return {
      ref: () => userCollection,
      doc: (other: string) => doc(userCollection, other),
    };
  };

  return {
    rooms: rooms,
    room: room,
    usernamesCollection: usernamesCollection,
    connections: connections,
  };
};

const db = entry();

export default db;
