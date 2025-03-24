import {
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  SnapshotOptions,
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
      activityLog: data.activityLog ?? [],
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
