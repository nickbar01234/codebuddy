import { usePeers } from "@cb/hooks/store";
import React from "react";
import { toast } from "sonner";

export * from "./useRunBuddyTest";

export const useCopyCode = () => {
  const { selectedPeer } = usePeers();
  return React.useCallback(() => {
    const maybeCode =
      selectedPeer?.questions[selectedPeer.url ?? ""]?.code?.value;
    if (maybeCode != undefined) {
      navigator.clipboard.writeText(maybeCode).then(() => {
        toast.success("Code copied to clipboard!");
      });
    }
  }, [selectedPeer]);
};
