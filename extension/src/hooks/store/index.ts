import { AppStatus, useApp, useRoom } from "@cb/store";
import { useLeetCode } from "@cb/store/leetCodeStore";
import React from "react";

export const useAuthUser = () => {
  const auth = useApp((state) => state.auth);
  if (auth.status !== AppStatus.AUTHENTICATED) {
    throw new Error(
      "useAuthUser when status is not authenticated. This is most likely a program bug."
    );
  }
  return { user: auth.user };
};

export const usePeers = () => {
  const peers = useRoom((state) => state.peers);
  const selectedPeer = React.useMemo(() => getSelectedPeer(peers), [peers]);
  return {
    peers,
    selectedPeer,
  };
};

export const useRoomStatus = () => useRoom((state) => state.status);

export const useRoomActions = () => useRoom((state) => state.actions.room);

export const usePeerActions = () => useRoom((state) => state.actions.peers);

export const useLeetCodeActions = () => useLeetCode((state) => state.actions);
