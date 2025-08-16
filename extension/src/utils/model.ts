import { InternalPeerState } from "@cb/types";

export const codeViewable = (peer: InternalPeerState | undefined) =>
  peer?.viewable ?? false;
