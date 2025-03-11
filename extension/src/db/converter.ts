import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
} from "firebase/firestore";
export interface Room {
  finishedUsers: string[];
  questionId: string;
  usernames: string[];
}

export interface PeerConnection {
  username?: string;

  offer?: RTCSessionDescriptionInit;
  offerCandidates: RTCIceCandidate[];

  answer?: RTCSessionDescriptionInit;
  answerCandidates: RTCIceCandidate[];
}

export const roomConverter: FirestoreDataConverter<Room, Room> = {
  toFirestore: (data: Room) => data,

  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Room => {
    const data = snapshot.data(options)! ?? {};
    return {
      ...data,
      finishedUsers: data.finishedUsers ?? [],
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
