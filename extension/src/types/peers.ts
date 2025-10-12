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

interface RequestProgressMessage extends PeerGenericMessage {
  action: "request-progress";
}

interface SendProgressMessage extends PeerGenericMessage {
  action: "sent-progress";
  code?: MonacoCode;
  tests?: TestCases;
}

export enum EventType {
  SUBMIT_SUCCESS,
  SUBMIT_FAILURE,
  ADD_QUESTION,
}

interface PeerGenericEventMessage extends PeerGenericMessage {
  action: "event";
  event: EventType;
  user: Id;
}

interface PeerEventSubmissionMesage extends PeerGenericEventMessage {
  event: EventType.SUBMIT_SUCCESS | EventType.SUBMIT_FAILURE;
}

interface PeerEventAddQuestionMessage extends PeerGenericEventMessage {
  event: EventType.ADD_QUESTION;
  question: string;
}

type PeerEventMessage = PeerEventSubmissionMesage | PeerEventAddQuestionMessage;

export type PeerMessage =
  | PeerCodeMessage
  | PeerTestMessage
  | PeerEventMessage
  | RequestProgressMessage
  | SendProgressMessage;

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
