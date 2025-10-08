import {
  Id,
  QuestionProgressStatus,
  SelectableTestCase,
  TestCase,
  TestCases,
} from ".";
import type { ServiceResponse } from "./services";
import { GenericMessage, Selectable } from "./utils";

export type Slug = string;

interface PeerGenericMessage extends GenericMessage {
  url: string;
}

type MonacoCode = ServiceResponse["getValue"];

export interface CodeWithChanges extends MonacoCode {
  changes?: string;
}

interface PeerCodeMessage extends PeerGenericMessage, CodeWithChanges {
  action: "code";
}

interface PeerTestMessage extends PeerGenericMessage {
  action: "tests";
  tests: TestCases;
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
  code?: CodeWithChanges;
  tests: SelectableTestCase[];
  status: QuestionProgressStatus;
}

interface SelfQuestionProgress {
  code?: MonacoCode;
  tests: TestCase[];
  status: QuestionProgressStatus;
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
