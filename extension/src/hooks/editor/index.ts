import { usePeers } from "@cb/hooks/store";
import background from "@cb/services/background";
import React from "react";

export const usePasteCode = () => {
  const { selectedPeer } = usePeers();
  return React.useCallback(
    () =>
      background.pasteCode({
        value: selectedPeer?.code?.value ?? "",
        language: selectedPeer?.code?.language ?? "",
      }),
    [selectedPeer]
  );
};
