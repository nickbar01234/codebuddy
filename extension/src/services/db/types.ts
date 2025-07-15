import { GenericMessage, Unsubscribe } from "@cb/types/utils";

export type User = string;

export type Version = number;

export type Id = string;

interface IceCandidateNegotiation extends GenericMessage {
  action: "ice";
  data: RTCIceCandidateInit | null;
}

interface DescriptionNegotiation extends GenericMessage {
  action: "description";
  data: RTCSessionDescriptionInit;
}

type NegotiationMessage = IceCandidateNegotiation | DescriptionNegotiation;

export enum Models {
  ROOMS = "rooms",
  NEGOTIATIONS = "negotiations",
}

export interface Negotiation {
  from: User;
  to: User;
  version: Version;
  message: NegotiationMessage;
}

export interface Room {
  usernames: User[];
  version: Version;
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

interface DatabaseRoomObserver {
  room(id: Id, cb: ObserverDocumentCallback<Room>): Unsubscribe;
  negotiations(
    id: Id,
    version: Version,
    cb: ObserverCollectionCallback<Negotiation>
  ): Unsubscribe;
}

interface DatabaseRoomService {
  create(room: Omit<Room, "version">): Promise<Id>;
  get(id: Id): Promise<Room | undefined>;
  addUser(id: Id, user: User): Promise<void>;
  removeUser(id: Id, user: User): Promise<void>;
  incrementVersion(id: Id): Promise<void>;
  observer: DatabaseRoomObserver;
}

export interface DatabaseService {
  room: DatabaseRoomService;
}
