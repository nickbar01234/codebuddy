import { PeerMessage } from "@cb/types/peers";
import {
  ExtractMessage,
  GenericMessage,
  Identifiable,
  MessagePayload,
  Unsubscribe,
} from "@cb/types/utils";

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

export type QuestionProgress = {
  code: MessagePayload<ExtractMessage<PeerMessage, "code">>;
  status: "not-started" | "in-progress" | "completed";
};

export type UserProgress = {
  questions: Record<string, QuestionProgress>;
};

export enum Models {
  ROOMS = "rooms",
  NEGOTIATIONS = "negotiations",
  USER_PROGRESS = "user_progress",
}

export interface Negotiation {
  from: User;
  to: User;
  version: Version;
  message: NegotiationMessage;
}

export interface Question {
  id: string;
  title: string;
  slug: string;
  difficulty: "Easy" | "Medium" | "Hard";
  tags: string[];
  url: string;
}

export interface Room {
  usernames: User[];
  version: Version;
  isPublic: boolean;
  name: string;
  questions: Question[];
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
  user(
    roomId: Id,
    username: User,
    cb: ObserverDocumentCallback<UserProgress>
  ): Unsubscribe;
}

interface DatabaseRoomService {
  create(
    room: Pick<Room, "name" | "isPublic" | "questions">
  ): Promise<Identifiable<Room>>;
  get(id: Id): Promise<Room | undefined>;
  addUser(id: Id, user: User): Promise<void>;
  removeUser(id: Id, user: User): Promise<void>;
  addQuestion(id: Id, question: Question): Promise<void>;
  addNegotiation(id: Id, data: Negotiation): Promise<void>;

  getUser(roomId: Id, username: User): Promise<UserProgress | undefined>;
  setUser(
    roomId: Id,
    username: User,
    progress: Partial<UserProgress>
  ): Promise<void>;

  observer: DatabaseRoomObserver;
}

export interface DatabaseService {
  room: DatabaseRoomService;
}
