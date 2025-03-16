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

export const getGroupRef = (groupId?: string) =>
  doc(
    collection(firestore, "groups"),
    ...[groupId].filter((segment) => segment != undefined)
  ).withConverter(groupConverter);

export const getGroup = (groupId: string) => getDoc(getGroupRef(groupId));

export const setGroup = (
  ref: DocumentReference<Group, Group>,
  data: Partial<WithFieldValue<Group>>
) => setDoc(ref, data, { merge: true });

export const getRoomQuestionRef = (groupId: string) =>
  collection(getGroupRef(groupId), "rooms").withConverter(roomConverter);

export const getRoomRef = (groupId: string, roomId: string) =>
  doc(getRoomQuestionRef(groupId), roomId).withConverter(roomConverter);

export const getRoom = (groupId: string, roomId: string) =>
  getDoc(getRoomRef(groupId, roomId));

export const setRoom = (
  ref: DocumentReference<Room, Room>,
  data: Partial<WithFieldValue<Room>>
) => setDoc(ref, data, { merge: true });

export const getRoomPeerConnectionRefs = (
  groupId: string,
  roomId: string,
  username: string
) =>
  collection(getRoomRef(groupId, roomId), username).withConverter(
    peerConnectionConverter
  );

export const getRoomPeerConnectionRef = (
  groupId: string,
  roomId: string,
  peer: string,
  username: string
) =>
  doc(getRoomPeerConnectionRefs(groupId, roomId, peer), username).withConverter(
    peerConnectionConverter
  );

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
