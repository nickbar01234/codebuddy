import { Id, SelectableTestCase, TestCase } from ".";
import type { ServiceResponse } from "./services";
import { GenericMessage, MessagePayload, Selectable } from "./utils";

export type Slug = string;

interface PeerGenericMessage extends GenericMessage {
  url: string;
}

type Code = ServiceResponse["getValue"];

interface PeerCodeMessage extends PeerGenericMessage, Code {
  action: "code";
  changes: string;
}

interface PeerTestMessage extends PeerGenericMessage {
  action: "tests";
  tests: TestCase[];
}

interface PeerHeartBeatMessage extends PeerGenericMessage {
  action: "heartbeat";
}

interface UrlChangeMessage extends PeerGenericMessage {
  action: "url";
}

export enum EventType {
  SUBMIT_SUCCESS,
  SUBMIT_FAILURE,
}

interface PeerEventMessage extends PeerGenericMessage {
  action: "event";
  event: EventType;
  user: Id;
}

export type PeerMessage =
  | PeerCodeMessage
  | PeerTestMessage
  | PeerHeartBeatMessage
  | PeerEventMessage
  | UrlChangeMessage;

interface PeerQuestionProgress {
  code?: Omit<MessagePayload<PeerCodeMessage>, "url">;
  tests: SelectableTestCase[];
  finished: boolean;
}

interface SelfQuestionProgress extends Omit<PeerQuestionProgress, "tests"> {
  tests: TestCase[];
}

export interface PeerState extends Selectable {
  questions: Record<Slug, PeerQuestionProgress | undefined>;
  url?: string;
}

// todo(nickbar01234) - Better way to structure this code?
export interface SelfState {
  questions: Record<Slug, SelfQuestionProgress>;
  url?: string;
}
