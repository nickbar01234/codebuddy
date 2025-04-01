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
    <h1 className="mb-4 text-center text-lg font-semibold text-black dark:text-white">
      Waiting for other to finish
      <ul>
        {unfinishedPeers.map(({ peerId, latency }) => (
          <li key={peerId + latency}> {peerId} </li>
        ))}
      </ul>
    </h1>
  );
};
