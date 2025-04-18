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
  username: string;
  output: string;
  status: "success" | "error";
}

export interface ConnectionEvent extends BaseEvent {
  type: "connection";
  username: string;
  status: "join" | "leave";
}

export interface MessageEvent extends BaseEvent {
  type: "message";
  username: string;
  message: string;
}

export type LogEvent = SubmissionEvent | ConnectionEvent | MessageEvent;

export interface Room {
  usernames: string[];
  isPublic: boolean;
  roomName: string;
  activityLog: LogEvent[];
}

export interface PeerConnection {
  username?: string;
  offer?: RTCSessionDescriptionInit;
  offerCandidates: RTCIceCandidate[];
  answer?: RTCSessionDescriptionInit;
  answerCandidates: RTCIceCandidate[];
}

export interface Session {
  finishedUsers: string[];
  usernames: string[];
  nextQuestion: string;
  createdAt: Timestamp;
}

export const logEventConverter: FirestoreDataConverter<LogEvent, LogEvent> = {
  toFirestore: (data: LogEvent) => data,
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): LogEvent => {
    const data = snapshot.data(options) ?? {};
    if (!data.type) {
      throw new Error("Log event type is missing");
    }
    switch (data.type) {
      case "submission":
        return {
          type: "submission",
          timestamp: data.timestamp ?? 0,
          username: data.username ?? "",
          output: data.output ?? "",
          status: data.status ?? "error", // Default fallback
        };
      case "connection":
        return {
          type: "connection",
          timestamp: data.timestamp ?? 0,
          username: data.username ?? "",
          status: data.status ?? "join",
        };
      case "message":
        return {
          type: "message",
          timestamp: data.timestamp ?? 0,
          username: data.username ?? "",
          message: data.message ?? "",
        };
      default:
        throw new Error(`Unknown log event type: ${data.type}`);
    }
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

export const roomConverter: FirestoreDataConverter<Room, Room> = {
  toFirestore: (data: Room) => data,
  fromFirestore: (
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): Room => {
    const data = snapshot.data(options) ?? {};
    return {
      ...data,
      isPublic: data.isPublic ?? true,
      roomName: data.roomName ?? "",
      usernames: data.usernames ?? [],
      activityLog: data.activityLog ?? [],
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
