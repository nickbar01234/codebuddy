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

interface UrlChangeMessage extends PeerGenericMessage {
  action: "url";
  url: string;
}

export enum EventType {
  SUBMIT_SUCCESS,
  SUBMIT_FAILURE,
  SELECT_QUESTION,
}

export enum RecoveryReason {
  CHANNEL_ERROR = "channel-error",
  ICE_FAILURE = "ice-failure",
  CONNECTION_TIMEOUT = "connection-timeout",
}

interface PeerEventMessage extends PeerGenericMessage {
  action: "event";
  event: EventType;
  user: Id;
}

export interface PeerRecoveryRequestMessage extends PeerGenericMessage {
  action: "recovery-request";
  requestId: string;
  reason: RecoveryReason;
  errorDetail?: string;
}

export interface PeerRecoveryAckMessage extends PeerGenericMessage {
  action: "recovery-ack";
  requestId: string;
}

export interface PeerRecoveryAbortMessage extends PeerGenericMessage {
  action: "recovery-abort";
  requestId: string;
  reason: string;
}

export type PeerMessage =
  | PeerCodeMessage
  | PeerTestMessage
  | PeerHeartBeatMessage
  | PeerEventMessage
  | UrlChangeMessage
  | PeerRecoveryRequestMessage
  | PeerRecoveryAckMessage
  | PeerRecoveryAbortMessage;

export interface PeerState extends Selectable {
  code?: MessagePayload<PeerCodeMessage>;
  tests: TestCase[];
  url?: string;
  latency: number;
  finished: boolean;
  viewable: boolean;
}
