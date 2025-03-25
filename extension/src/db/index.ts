import {
  LogEvent,
  PeerConnection,
  peerConnectionConverter,
  Room,
  roomConverter,
  logEventConverter,
} from "@cb/db/converter";
import { auth, firestore } from "@cb/db/setup";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  DocumentReference,
  getDoc,
  setDoc,
  WithFieldValue,
} from "firebase/firestore";

export { auth, firestore };

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
export const addEventToRoom = (
  data: Omit<LogEvent, "timestamp">,
  roomId: string
) => {
  const roomRef = getRoomRef(roomId);
  addDoc(collection(roomRef, "logs").withConverter(logEventConverter), data);
};

export const setRoomPeerConnection = (
  ref: DocumentReference<PeerConnection, PeerConnection>,
  data: Partial<WithFieldValue<PeerConnection>>
) => setDoc(ref, data, { merge: true });

export const deleteRoomPeerConnection = (
  ref: DocumentReference<PeerConnection, PeerConnection>
) => deleteDoc(ref);

export const checkRoomExist = async (roomId: string) => {
  const roomDoc = await getRoom(roomId);
  return roomDoc.exists();
};
