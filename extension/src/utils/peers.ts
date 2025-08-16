import { Id, InternalPeerState } from "@cb/types";

export const getSelectedPeer = (peers: Record<Id, InternalPeerState>) => {
  const selected = Object.keys(peers).find((peer) => peers[peer]?.selected);
  return selected == undefined
    ? undefined
    : { id: selected, ...peers[selected] };
};
