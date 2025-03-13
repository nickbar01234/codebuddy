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

export const getGroupRef = (groupId: string) =>
  doc(collection(firestore, "groups"), groupId).withConverter(groupConverter);

export const getGroup = async (groupId: string) => {
  const groupDoc = await getDoc(getGroupRef(groupId));
  return groupDoc.exists() ? groupDoc.data() : null;
};

export const setGroup = (
  ref: DocumentReference<Group, Group>,
  data: Partial<WithFieldValue<Group>>
) => setDoc(ref, data, { merge: true });

export const getRoomRef = (groupId: string, roomId: string) =>
  doc(collection(firestore, "groups", groupId, "rooms"), roomId).withConverter(
    roomConverter
  );

export const getRoom = (groupId: string, roomId: string) =>
  getDoc(getRoomRef(groupId, roomId));

export const setRoom = (
  ref: DocumentReference<Room, Room>,
  data: Partial<WithFieldValue<Room>>
) => setDoc(ref, data, { merge: true });

// **Peer Connection Functions**
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
  username: string,
  peer: string
) =>
  doc(getRoomPeerConnectionRefs(groupId, roomId, username), peer).withConverter(
    peerConnectionConverter
  );

export const setRoomPeerConnection = (
  ref: DocumentReference<PeerConnection, PeerConnection>,
  data: Partial<WithFieldValue<PeerConnection>>
) => setDoc(ref, data, { merge: true });

export const deleteRoomPeerConnection = (
  ref: DocumentReference<PeerConnection, PeerConnection>
) => deleteDoc(ref);
