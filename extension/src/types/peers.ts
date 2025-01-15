import type { ServiceResponse } from "./services";
import { GenericMessage, MessagePayload } from "./utils";

interface PeerCodeMessage extends GenericMessage {
  action: "code";
  code: ServiceResponse["getValue"];
  changes: string;
}

interface PeerTestMessage extends GenericMessage {
  action: "tests";
  tests: string[];
}

export type PeerMessage = PeerCodeMessage | PeerTestMessage;

export interface PeerInformation {
  code?: MessagePayload<PeerCodeMessage>;
  tests?: MessagePayload<PeerTestMessage>;
}
