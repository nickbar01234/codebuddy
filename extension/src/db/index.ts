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
  Session,
  sessionConverter,
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

export const getSessionQuestionRef = (roomId: string) =>
  collection(getGroupRef(roomId), "sessions").withConverter(sessionConverter);

export const getSessionRef = (roomId: string, sessionId: string) =>
  doc(getSessionQuestionRef(roomId), sessionId).withConverter(sessionConverter);

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
