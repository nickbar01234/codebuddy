import { PeerState } from "@cb/types";

export const codeViewable = (peer: PeerState | undefined) =>
  peer?.viewable ?? false;
