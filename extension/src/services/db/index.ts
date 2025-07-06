import { firebaseDatabaseImpl } from "./firebase";

export enum Model {
  ROOMS = "rooms",
  CONNECTIONS = "connections",
}

export type ObserverDocumentCallback<T> = {
  onChange: (data: T) => void;
  onNotFound?: () => void;
};

export type ObserverCollectionCallback<T> = {
  onAdded: (data: T) => void;
  onModified: (data: T) => void;
  onDeleted: (data: T) => void;
};

export type Unsubscribe = () => void;

export interface Room {
  roomName: string;
  usernames: string[];
  isPublic: boolean;
}

export interface Connection {
  offer?: RTCSessionDescriptionInit;
  offerCandidates: RTCIceCandidate[];
  answer?: RTCSessionDescriptionInit;
  answerCandidates: RTCIceCandidate[];
}

export interface DatabaseObserver {
  subscribeToRoom: (
    id: string,
    cb: ObserverDocumentCallback<Room>
  ) => Unsubscribe;
  subscribeToRooms: (cb: ObserverCollectionCallback<Room>) => Unsubscribe;
  subscribeToConnection: (
    id: string,
    from: string,
    to: string,
    cb: ObserverDocumentCallback<Connection>
  ) => Unsubscribe;
}

export interface Database {
  createRoom: (room: Room) => Promise<string>;
  getRoom: (id: string) => Promise<Room | undefined>;
  setRoom: (id: string, room: Partial<Room>) => Promise<void>;
  listener: () => DatabaseObserver;
}

const db = firebaseDatabaseImpl;

export default db;
