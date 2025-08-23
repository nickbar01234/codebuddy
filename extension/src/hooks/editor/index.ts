import { usePeers } from "@cb/hooks/store";
import { getOrCreateWindowMesseger } from "@cb/services/messenger";
import React from "react";

export const usePasteCode = () => {
  const { selectedPeer } = usePeers();
  return React.useCallback(
    () =>
      getOrCreateWindowMesseger().sendMessage(
        "paste",
        selectedPeer?.code?.value ?? ""
      ),
    [selectedPeer]
  );
};
