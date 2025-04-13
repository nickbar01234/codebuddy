import { useRTC } from "@cb/hooks/index";
import React from "react";

export const Wait = () => {
  const { peerState } = useRTC();
  const unfinishedPeers = React.useMemo(
    () =>
      Object.entries(peerState)
        .filter(([_, state]) => !state.finished)
        .map(([peerId, state]) => ({ peerId, ...state })),
    [peerState]
  );

  return (
    <h1 className="mb-4 text-center text-lg font-semibold text-tertiary">
      Waiting for other to finish
      <div className="flex">
        {unfinishedPeers.map(({ peerId, latency }) => (
          <span key={peerId + latency}> {peerId} </span>
        ))}
      </div>
    </h1>
  );
};
