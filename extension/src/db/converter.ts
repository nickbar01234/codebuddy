import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
  Timestamp,
} from "firebase/firestore";

export interface BaseEvent {
  type: string;
  timestamp: number;
}

export interface SubmissionEvent extends BaseEvent {
  type: "submission";
  payload: {
    username: string;
    output: string;
    status: "success" | "error";
  };
}

export interface ConnectionEvent extends BaseEvent {
  type: "connection";
  payload: {
    username: string;
    status: "join" | "leave";
  };
}

export interface MessageEvent extends BaseEvent {
  type: "message";
  payload: {
    username: string;
    message: string;
    color: string;
  };
}
export type LogEvent = SubmissionEvent | ConnectionEvent | MessageEvent;

export interface Room {
  questionId: string;
  usernames: string[];
  activityLog: LogEvent[];
}

export interface PeerConnection {
  username?: string;
  offer?: RTCSessionDescriptionInit;
  offerCandidates: RTCIceCandidate[];
  answer?: RTCSessionDescriptionInit;
  answerCandidates: RTCIceCandidate[];
}

export interface Room {
  usernames: string[];
}

export interface Session {
  finishedUsers: string[];
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
      usernames: data.usernames ?? [],
      nextQuestion: data.nextQuestion ?? "",
      createdAt: data.createdAt ?? Timestamp.now(),
    };
  },
};
