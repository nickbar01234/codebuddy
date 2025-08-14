import { _PeerState, Peer } from "@cb/types";

export const codeViewable = (peer: Peer | undefined | _PeerState) =>
  peer?.viewable ?? false;
