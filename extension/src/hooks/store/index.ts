import { useApp, useRoom } from "@cb/store";
import { useLeetCode } from "@cb/store/leetCodeStore";
import React from "react";

export const useAuthUser = () => useApp((state) => state.actions.getAuthUser());

export const useAppPreference = () => useApp((state) => state.app);

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

export const useAuthActions = () => {
  const authenticate = useApp((state) => state.actions.authenticate);
  const unauthenticate = useApp((state) => state.actions.unauthenticate);
  const getAuthUser = useApp((state) => state.actions.getAuthUser);
  return { authenticate, unauthenticate, getAuthUser };
};

export const useAppActions = () => {
  const collapseExtension = useApp((state) => state.actions.collapseExtension);
  const expandExtension = useApp((state) => state.actions.expandExtension);
  const setAppWidth = useApp((state) => state.actions.setAppWidth);
  return { collapseExtension, expandExtension, setAppWidth };
};
