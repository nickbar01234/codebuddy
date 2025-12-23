import { usePeers } from "@cb/hooks/store";
import background from "@cb/services/background";
import { ResponseStatus, SelectableTestCase } from "@cb/types";
import { testCaseToValues } from "@cb/utils/string";
import { debounce } from "lodash";
import React from "react";
import { toast } from "sonner";

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

export const useCopyTestCaseToLeetCode = () => {
  const copyFunction = React.useCallback(
    (activeTestParam: SelectableTestCase | undefined) => {
      if (!activeTestParam) {
        toast.error("No test case selected");
        return;
      }

      const testValues = testCaseToValues(activeTestParam);

      background
        .appendTestCaseToLeetCode({ testValues })
        .then((response) => {
          if (response?.status === ResponseStatus.SUCCESS) {
            toast.success("Copied test case!");
          } else {
            console.error("Failed to copy test case:", response);
            toast.error("Failed to copy test case");
          }
        })
        .catch((error) => {
          console.error("Failed to copy test case:", error);
          toast.error("Failed to copy test case");
        });
    },
    []
  );
  return React.useMemo(() => debounce(copyFunction, 500), [copyFunction]);
};
