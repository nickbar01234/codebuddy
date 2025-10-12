import { GenericMessage, Identifiable, Unsubscribe } from "@cb/types/utils";
import { TestCases } from ".";
import { ServiceResponse } from "./services";

export type User = string;

export type Version = number;

export type Id = string;

interface CodeSnippet {
  langSlug: string;
  code: string;
}

interface IceCandidateNegotiation extends GenericMessage {
  action: "ice";
  data: RTCIceCandidateInit | null;
}

interface DescriptionNegotiation extends GenericMessage {
  action: "description";
  data: RTCSessionDescriptionInit;
}

type NegotiationMessage = IceCandidateNegotiation | DescriptionNegotiation;

export enum QuestionProgressStatus {
  NOT_STARTED = "not-started",
  IN_PROGRESS = "in-progress",
  COMPLETED = "completed",
}

export type QuestionProgress = {
  code: ServiceResponse["getValue"];
  tests: TestCases;
  status: QuestionProgressStatus;
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
  codeSnippets: CodeSnippet[];
  testSnippets: string[];
  variables: string[];
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

  getUserProgress(
    roomId: Id,
    username: User
  ): Promise<UserProgress | undefined>;
  setUserProgress(
    roomId: Id,
    username: User,
    progress: Partial<UserProgress>
  ): Promise<void>;

  observer: DatabaseRoomObserver;
}

export interface DatabaseService {
  room: DatabaseRoomService;
}
