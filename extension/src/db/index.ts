import {
  LogEvent,
  logEventConverter,
  PeerConnection,
  peerConnectionConverter,
  Room,
  roomConverter,
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
  limit,
  orderBy,
  query,
  setDoc,
  startAfter,
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
export const addEventToRoom = (data: LogEvent, roomId: string) => {
  const roomRef = getRoomRef(roomId);
  addDoc(collection(roomRef, "logs"), data);
};

export const getEventsFromRoom = async (
  roomId: string,
  maxLimit: number,
  lastEvent?: number | LogEvent
) => {
  const roomRef = getRoomRef(roomId);

  let q = query(
    collection(roomRef, "logs"),
    orderBy("timestamp", "desc"),
    limit(maxLimit)
  );

  if (lastEvent !== undefined) {
    const timestamp =
      typeof lastEvent === "number" ? lastEvent : lastEvent.timestamp;
    q = query(q, startAfter(timestamp));
  }

  q = q.withConverter(logEventConverter);

  return getDocs(q);
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
