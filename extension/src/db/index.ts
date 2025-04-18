import {
  LogEvent,
  PeerConnection,
  peerConnectionConverter,
  Room,
  roomConverter,
  Session,
  sessionConverter,
} from "@cb/db/converter";
import { auth, firestore } from "@cb/db/setup";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  WithFieldValue,
} from "firebase/firestore";

export { auth, firestore };

export const getRoomRef = (roomId?: string) =>
  doc(
    collection(firestore, "rooms"),
    ...[roomId].filter((segment) => segment != undefined)
  ).withConverter(roomConverter);

export const getRoom = (roomId: string) => getDoc(getRoomRef(roomId));

export const setRoom = (
  ref: DocumentReference<Room, Room>,
  data: Partial<WithFieldValue<Room>>
) => setDoc(ref, data, { merge: true });

export const addEventToRoom = (data: LogEvent, roomId: string) => {
  const roomRef = getRoomRef(roomId);
  addDoc(collection(roomRef, "logs"), data);
};

export const getSessionRefs = (roomId: string) =>
  collection(getRoomRef(roomId), "sessions").withConverter(sessionConverter);

export const getSessionRef = (roomId: string, sessionId: string) =>
  doc(getSessionRefs(roomId), sessionId).withConverter(sessionConverter);

export const getSession = (roomId: string, sessionId: string) =>
  getDoc(getSessionRef(roomId, sessionId));

export const setSession = (
  ref: DocumentReference<Session, Session>,
  data: Partial<WithFieldValue<Session>>
) => setDoc(ref, data, { merge: true });

export const getSessionPeerConnectionRefs = (
  roomId: string,
  sessionId: string,
  username: string
) =>
  collection(getSessionRef(roomId, sessionId), username).withConverter(
    peerConnectionConverter
  );

export const getAllSessionId = async (roomId: string) => {
  // This function will return all sessions in a room.
  // Note: This is not efficient for large datasets, consider using query for pagination or filtering.
  const sessionRefs = getSessionRefs(roomId);
  const sessionQuery = query(sessionRefs, orderBy("createdAt"));
  const snapshot = await getDocs(sessionQuery);
  return snapshot.docs.map((doc) => doc.id);
};

export const getSessionPeerConnectionRef = (
  roomId: string,
  sessionId: string,
  peer: string,
  username: string
) =>
  doc(
    getSessionPeerConnectionRefs(roomId, sessionId, peer),
    username
  ).withConverter(peerConnectionConverter);

export const setSessionPeerConnection = (
  ref: DocumentReference<PeerConnection, PeerConnection>,
  data: Partial<WithFieldValue<PeerConnection>>
) => setDoc(ref, data, { merge: true });

export const deleteSessionPeerConnection = (
  ref: DocumentReference<PeerConnection, PeerConnection>
) => deleteDoc(ref);
