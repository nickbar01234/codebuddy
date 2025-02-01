import { initializeApp } from "firebase/app";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  setDoc,
  DocumentReference,
  WithFieldValue,
} from "firebase/firestore";

import { firebaseOptions } from "@cb/constants";
import {
  PeerConnection,
  peerConnectionConverter,
  Room,
  roomConverter,
} from "@cb/db/converter";
import { getAuth } from "firebase/auth";

const app = initializeApp(firebaseOptions);

export const auth = getAuth(app);

export const firestore = getFirestore(app);

export const getRoomRef = (id?: string) =>
  doc(
    collection(firestore, "rooms"),
    ...[id].filter((segment) => segment != undefined)
  ).withConverter(roomConverter);

export const getRoom = (id: string) => getDoc(getRoomRef(id));

export const setRoom = (
  ref: DocumentReference<Room, Room>,
  data: Partial<WithFieldValue<Room>>
) => setDoc(ref, data, { merge: true });

export const getRoomPeerConnectionRefs = (id: string, username: string) =>
  collection(getRoomRef(id), username).withConverter(peerConnectionConverter);

export const getRoomPeerConnectionRef = (
  id: string,
  peer: string,
  username: string
) =>
  doc(getRoomPeerConnectionRefs(id, peer), username).withConverter(
    peerConnectionConverter
  );

export const setRoomPeerConnection = (
  ref: DocumentReference<PeerConnection, PeerConnection>,
  data: Partial<WithFieldValue<PeerConnection>>
) => setDoc(ref, data, { merge: true });

export const deleteRoomPeerConnection = (
  ref: DocumentReference<PeerConnection, PeerConnection>
) => deleteDoc(ref);
