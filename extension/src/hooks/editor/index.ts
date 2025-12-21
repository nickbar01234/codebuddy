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
          console.log("appendTestCaseToLeetCode response:", response);

          if (response === undefined || response === null) {
            console.error("Response is undefined or null");
            toast.error(
              "Failed to add test case to LeetCode: No response received"
            );
            return;
          }

          if (typeof response !== "object") {
            console.error("Invalid response type:", typeof response, response);
            toast.error(
              `Failed to add test case to LeetCode: Invalid response type (${typeof response})`
            );
            return;
          }

          if (!("status" in response)) {
            console.error("Response missing status property:", response);
            toast.error(
              "Failed to add test case to LeetCode: Invalid response format"
            );
            return;
          }

          if (response.status === ResponseStatus.SUCCESS) {
            toast.success("Test case added to LeetCode!");
          } else {
            toast.error(
              (response as any).message ?? "Failed to add test case to LeetCode"
            );
          }
        })
        .catch((error) => {
          console.error("Failed to add test case:", error);
          toast.error(
            `Failed to add test case to LeetCode: ${error?.message ?? "Unknown error"}`
          );
        });
    },
    []
  );
  return React.useMemo(() => debounce(copyFunction, 500), [copyFunction]);
};
