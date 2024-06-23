import { initializeApp } from "firebase/app";
import { collection, doc, getDoc, getFirestore } from "firebase/firestore";
import { peerConnectionConverter, roomConverter } from "./converter";

const config = {
  // TODO(nickbar01234) - Remove API key
  apiKey: "AIzaSyBDu1Q1vQVi1x6U0GfWXIFmohb32jIhKjY",
  authDomain: "codebuddy-1b0dc.firebaseapp.com",
  projectId: "codebuddy-1b0dc",
  storageBucket: "codebuddy-1b0dc.appspot.com",
  messagingSenderId: "871987263347",
  appId: "1:871987263347:web:cb21306ac3d48eb4e5b706",
  measurementId: "G-64K0SVBGFK",
};

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
    connections: connections,
  };
};

const db = entry();

export default db;
