import { firestore, auth } from "@cb/db/setup";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  setDoc,
  DocumentReference,
  WithFieldValue,
} from "firebase/firestore";

import {
  PeerConnection,
  peerConnectionConverter,
  Room,
  roomConverter,
  Group,
  groupConverter,
} from "@cb/db/converter";

export { firestore, auth };

export const getGroupRef = (roomId?: string) =>
  doc(
    collection(firestore, "groups"),
    ...[roomId].filter((segment) => segment != undefined)
  ).withConverter(groupConverter);

export const getGroup = (roomId: string) => getDoc(getGroupRef(roomId));

export const setGroup = (
  ref: DocumentReference<Group, Group>,
  data: Partial<WithFieldValue<Group>>
) => setDoc(ref, data, { merge: true });

export const getRoomQuestionRef = (roomId: string) =>
  collection(getGroupRef(roomId), "rooms").withConverter(roomConverter);

export const getRoomRef = (roomId: string, sessionId: string) =>
  doc(getRoomQuestionRef(roomId), sessionId).withConverter(roomConverter);

export const getRoom = (roomId: string, sessionId: string) =>
  getDoc(getRoomRef(roomId, sessionId));

export const setRoom = (
  ref: DocumentReference<Room, Room>,
  data: Partial<WithFieldValue<Room>>
) => setDoc(ref, data, { merge: true });

export const getRoomPeerConnectionRefs = (
  roomId: string,
  sessionId: string,
  username: string
) =>
  collection(getRoomRef(roomId, sessionId), username).withConverter(
    peerConnectionConverter
  );

export const getRoomPeerConnectionRef = (
  roomId: string,
  sessionId: string,
  peer: string,
  username: string
) =>
  doc(
    getRoomPeerConnectionRefs(roomId, sessionId, peer),
    username
  ).withConverter(peerConnectionConverter);

export const setRoomPeerConnection = (
  ref: DocumentReference<PeerConnection, PeerConnection>,
  data: Partial<WithFieldValue<PeerConnection>>
) => setDoc(ref, data, { merge: true });

export const deleteRoomPeerConnection = (
  ref: DocumentReference<PeerConnection, PeerConnection>
) => deleteDoc(ref);
