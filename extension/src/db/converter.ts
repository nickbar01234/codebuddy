import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from "firebase/firestore";

export interface Room {
  finishedUsers: string[];
  questionId: string;
  usernames: string[];
  nextQuestion: string;
  createdAt: Timestamp;
}

export interface PeerConnection {
  username?: string;
  offer?: RTCSessionDescriptionInit;
  offerCandidates: RTCIceCandidate[];
  answer?: RTCSessionDescriptionInit;
  answerCandidates: RTCIceCandidate[];
}

export interface Group {
  questions: string[];
  users: string[];
}

export const roomConverter: FirestoreDataConverter<Room, Room> = {
  toFirestore: (data: Room) => {
    return data;
  },
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Room => {
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

export const groupConverter: FirestoreDataConverter<Group, Group> = {
  toFirestore: (data: Group) => data,
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Group => {
    const data = snapshot.data(options) ?? {};
    return {
      ...data,
      questions: data.questions ?? [],
      users: data.users ?? [],
    };
  },
};
