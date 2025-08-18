import { Id, PeerState } from "@cb/types";

export const getSelectedPeer = (peers: Record<Id, PeerState>) => {
  const selected = Object.keys(peers).find((peer) => peers[peer]?.selected);
  return selected == undefined
    ? undefined
    : { id: selected, ...peers[selected] };
};
