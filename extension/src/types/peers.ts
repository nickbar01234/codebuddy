import { Id, SelectableTestCase, TestCase } from ".";
import type { ServiceResponse } from "./services";
import { GenericMessage, MessagePayload, Selectable } from "./utils";

interface PeerGenericMessage extends GenericMessage {
  timestamp: number;
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
  url: string;
}

export enum EventType {
  SUBMIT_SUCCESS,
  SUBMIT_FAILURE,
  SELECT_QUESTION,
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

export interface PeerState extends Selectable {
  code?: MessagePayload<PeerCodeMessage>;
  tests: SelectableTestCase[];
  url?: string;
  latency: number;
  finished: boolean;
  viewable: boolean;
}
