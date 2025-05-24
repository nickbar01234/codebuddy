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

export type RoomEvent = SubmissionEvent | ConnectionEvent | MessageEvent;

export interface Room {
  usernames: string[];
  isPublic: boolean;
  roomName: string;
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

const defaultEventValues: {
  [K in RoomEvent["type"]]: Omit<
    Partial<Extract<RoomEvent, { type: K }>>,
    "type" | "timestamp"
  >;
} = {
  submission: { username: "", output: "", status: "error" },
  connection: { username: "", status: "join" },
  message: { username: "", message: "" },
};

export const roomEventConverter: FirestoreDataConverter<RoomEvent, RoomEvent> =
  {
    toFirestore: (data: RoomEvent) => data,
    fromFirestore: (
      snapshot: QueryDocumentSnapshot,
      options: SnapshotOptions
    ): RoomEvent => {
      const data = snapshot.data(options) ?? {};
      if (!Object.keys(defaultEventValues).includes(data.type)) {
        throw new Error(`Unknown or missing event type: ${data.type}`);
      }

      return {
        type: data.type,
        timestamp: data.timestamp ?? 0,
        ...defaultEventValues[data.type as RoomEvent["type"]],
        ...data,
      } as RoomEvent;
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
