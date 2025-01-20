import type { ServiceResponse } from "./services";
import { GenericMessage, MessagePayload } from "./utils";

interface PeerGenericMessage extends GenericMessage {
  timestamp: number;
}

interface PeerCodeMessage extends PeerGenericMessage {
  action: "code";
  code: ServiceResponse["getValue"];
  changes: string;
}

interface PeerTestMessage extends PeerGenericMessage {
  action: "tests";
  tests: string[];
}

interface PeerHeartBeatMessage extends PeerGenericMessage {
  action: "heartbeat";
}

interface PeerEventMessage extends PeerGenericMessage {
  action: "event";
  event: string;
  eventMessage: string;
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

export interface PeerState {
  latency: number;
  deviation: number;
}
