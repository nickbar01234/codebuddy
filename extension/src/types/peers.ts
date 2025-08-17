import { Id, TestCase } from ".";
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
  tests: string[];
}

interface PeerHeartBeatMessage extends PeerGenericMessage {
  action: "heartbeat";
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
  | PeerEventMessage;

export interface PeerInformation {
  code?: MessagePayload<PeerCodeMessage>;
  tests?: MessagePayload<PeerTestMessage>;
}

// todo(nickbar01234): Rename
export interface PeerState extends Selectable {
  code?: MessagePayload<PeerCodeMessage>;
  tests: MessagePayload<PeerTestMessage>;
  latency: number;
  finished: boolean;
  viewable: boolean;
}

export interface InternalPeerState extends Omit<PeerState, "tests"> {
  tests: TestCase[];
}
