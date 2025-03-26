import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from "firebase/firestore";

export interface PeerConnection {
  username?: string;
  offer?: RTCSessionDescriptionInit;
  offerCandidates: RTCIceCandidate[];
  answer?: RTCSessionDescriptionInit;
  answerCandidates: RTCIceCandidate[];
}

export interface Room {
  questions: string[];
  usernames: string[];
}

export interface Session {
  finishedUsers: string[];
  questionId: string;
  usernames: string[];
  nextQuestion: string;
  createdAt: Timestamp;
}

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

export const roomConverter: FirestoreDataConverter<Room, Room> = {
  toFirestore: (data: Room) => data,
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Room => {
    const data = snapshot.data(options) ?? {};
    return {
      ...data,
      questions: data.questions ?? [],
      usernames: data.usernames ?? [],
    };
  },
};
export const sessionConverter: FirestoreDataConverter<Session, Session> = {
  toFirestore: (data: Session) => {
    return data;
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Session => {
    const data = snapshot.data(options) ?? {};
    return {
      ...data,
      finishedUsers: data.finishedUsers ?? [],
      questionId: data.questionId ?? "",
      usernames: data.usernames ?? [],
      nextQuestion: data.nextQuestion ?? "",
      createdAt: data.createdAt ?? Timestamp.now(),
    };
  },
};
