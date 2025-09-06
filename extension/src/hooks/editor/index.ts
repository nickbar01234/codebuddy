import { usePeers } from "@cb/hooks/store";
import React from "react";
import { toast } from "sonner";

export const useCopyCode = () => {
  const { selectedPeer } = usePeers();
  return React.useCallback(() => {
    if (selectedPeer?.code?.value) {
      navigator.clipboard.writeText(selectedPeer.code.value).then(() => {
        toast.success("Code copied to clipboard!");
      });
    }
  }, [selectedPeer]);
};
