import { usePeers, useRoomData } from "@cb/hooks/store";
import { getOrCreateControllers } from "@cb/services";
import background from "@cb/services/background";
import { useRoom } from "@cb/store";
import { ResponseStatus, SelectableTestCase } from "@cb/types";
import { getNormalizedUrl } from "@cb/utils";
import { testCaseToValues } from "@cb/utils/string";
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
  const { selectedPeer } = usePeers();
  const { self } = useRoomData();
  const getVariables = useRoom((state) => state.actions.room.getVariables);

  return React.useCallback(
    (activeTestParam: SelectableTestCase | undefined) => {
      const url = self?.url ?? "";
      const normalizedUrl = getNormalizedUrl(url);

      if (!selectedPeer?.id) {
        toast.error("No peer selected");
        return;
      }

      if (!activeTestParam) {
        toast.error("No test case selected");
        return;
      }

      const variables = getVariables(url);
      if (!variables) {
        toast.error("Question variables not found");
        return;
      }

      const activeTest = activeTestParam;

      const currentTestValues = testCaseToValues(activeTest);
      const currentTestSignature = JSON.stringify(currentTestValues);

      const { emitter } = getOrCreateControllers();

      emitter.emit("rtc.send.message", {
        to: selectedPeer.id,
        message: {
          action: "request-progress",
          url: normalizedUrl,
        },
      });

      const maxWaitTime = 2000;
      const pollInterval = 50;
      const startTime = Date.now();

      const checkForUpdate = () => {
        const freshPeer = useRoom.getState().peers[selectedPeer.id];
        const freshTests = freshPeer?.questions[normalizedUrl]?.tests;
        const elapsed = Date.now() - startTime;

        const matchingTest = freshTests?.find((test) => {
          const testValues = testCaseToValues(test);
          const testSignature = JSON.stringify(testValues);
          return testSignature === currentTestSignature;
        });

        const freshActiveTest =
          matchingTest ?? freshTests?.find((test) => test.selected);

        if (!freshActiveTest) {
          if (elapsed >= maxWaitTime) {
            const testValues = testCaseToValues(activeTest);
            background
              .appendTestCaseToLeetCode({ testValues })
              .then((response) => {
                console.log("appendTestCaseToLeetCode response:", response);
                if (!response || typeof response !== "object") {
                  console.error("Invalid response:", response);
                  toast.error(
                    "Failed to add test case to LeetCode: No response"
                  );
                  return;
                }
                if (!("status" in response)) {
                  console.error("Response missing status property:", response);
                  toast.error(
                    "Failed to add test case to LeetCode: Invalid response"
                  );
                  return;
                }
                if (response.status === ResponseStatus.SUCCESS) {
                  toast.success("Test case added to LeetCode!");
                } else {
                  toast.error(
                    (response as any).message ??
                      "Failed to add test case to LeetCode"
                  );
                }
              })
              .catch((error) => {
                console.error("Failed to add test case:", error);
                toast.error("Failed to add test case to LeetCode");
              });
            return;
          }
          setTimeout(checkForUpdate, pollInterval);
          return;
        }

        const freshTestValues = testCaseToValues(freshActiveTest);
        const freshTestSignature = JSON.stringify(freshTestValues);
        const hasUpdated = freshTestSignature !== currentTestSignature;

        if (hasUpdated || elapsed >= maxWaitTime) {
          const testValues = testCaseToValues(freshActiveTest);

          background
            .appendTestCaseToLeetCode({ testValues })
            .then((response) => {
              console.log("appendTestCaseToLeetCode response:", response);
              if (!response || typeof response !== "object") {
                console.error("Invalid response:", response);
                toast.error("Failed to add test case to LeetCode: No response");
                return;
              }
              if (!("status" in response)) {
                console.error("Response missing status property:", response);
                toast.error(
                  "Failed to add test case to LeetCode: Invalid response"
                );
                return;
              }
              if (response.status === ResponseStatus.SUCCESS) {
                toast.success("Test case added to LeetCode!");
              } else {
                toast.error(
                  (response as any).message ??
                    "Failed to add test case to LeetCode"
                );
              }
            })
            .catch((error) => {
              console.error("Failed to add test case:", error);
              toast.error("Failed to add test case to LeetCode");
            });
        } else {
          setTimeout(checkForUpdate, pollInterval);
        }
      };

      setTimeout(checkForUpdate, 200);
    },
    [selectedPeer, self, getVariables]
  );
};
