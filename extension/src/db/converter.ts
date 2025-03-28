import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
import { Room, PeerConnection } from "@cb/common/firebase";

export type { Room, PeerConnection };

export const roomConverter: FirestoreDataConverter<Room, Room> = {
  toFirestore: (data: Room) => data,

  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Room => {
    const data = snapshot.data(options)! ?? {};
    return {
      ...data,
      questionId: data.questionId ?? "",
      usernames: data.usernames ?? [],
    };
  },
};

export const peerConnectionConverter: FirestoreDataConverter<
  PeerConnection,
  PeerConnection
> = {
  toFirestore: (data: PeerConnection) => data,

  fromFirestore: (snapshot, options) => {
    const data = snapshot.data(options) ?? {};
    return {
      ...data,
      offerCandidates: data.offerCandidates ?? [],
      answerCandidates: data.answerCandidates ?? [],
    };
  },
};
