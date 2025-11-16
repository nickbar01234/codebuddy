import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { useRoomData } from "@cb/hooks/store";
import { Identifiable, PeerState, SelectableTestResult } from "@cb/types";
import React from "react";

interface TestResultTabProps {
  activePeer: Identifiable<PeerState> | undefined;
  activeTestResult: SelectableTestResult | undefined;
  selectTestResult: (index: number) => void;
}

export const TestResultTab: React.FC<TestResultTabProps> = ({
  activePeer,
  activeTestResult,
  selectTestResult,
}) => {
  console.log("activeTestResult", activeTestResult);
  const { self } = useRoomData();
  return (
    <SkeletonWrapper loading={false} className="relative">
      <div className="p-5 flex flex-col space-y-4 h-full w-full overflow-scroll hide-scrollbar">
        <div className="flex w-full flex-row items-start justify-between gap-4">
          <div className="hide-scrollbar flex flex-nowrap items-center gap-x-2 gap-y-4 overflow-x-scroll">
            {(activePeer?.questions[self?.url ?? ""]?.tests ?? []).map(
              (test, idx) => (
                <div key={idx} onClick={() => selectTestResult(idx)}>
                  {test.selected ? (
                    <button className="bg-fill-3 dark:bg-dark-fill-3 hover:bg-fill-2 dark:hover:bg-dark-fill-2 hover:text-label-1 dark:hover:text-dark-label-1 text-label-1 dark:text-dark-label-1 relative inline-flex items-center whitespace-nowrap rounded-lg px-4 py-1 font-medium focus:outline-none">
                      Case {idx + 1}
                    </button>
                  ) : (
                    <button className="hover:bg-fill-2 dark:hover:bg-dark-fill-2 text-label-2 dark:text-dark-label-2 hover:text-label-1 dark:hover:text-dark-label-1 dark:bg-dark-transparent relative inline-flex items-center whitespace-nowrap rounded-lg bg-transparent px-4 py-1 font-medium focus:outline-none">
                      Case {idx + 1}
                    </button>
                  )}
                </div>
              )
            )}
          </div>
        </div>
        <div className="space-y-4 pb-12">
          <div>
            <div className="flex h-full w-full flex-col space-y-2">
              {activeTestResult?.testResult.map((assignment, idx) => (
                <React.Fragment key={idx}>
                  {/* Input / Value */}
                  <div className="text-label-3 dark:text-dark-label-3 text-xs font-medium">
                    Input
                  </div>
                  <div className="font-menlo bg-fill-3 dark:bg-dark-fill-3 w-full cursor-text rounded-lg border border-transparent px-3 py-[10px]">
                    <div className="font-menlo placeholder:text-label-4 dark:placeholder:text-dark-label-4 sentry-unmask w-full resize-none whitespace-pre-wrap break-words outline-none">
                      {assignment.variable} = {assignment.value}
                    </div>
                  </div>

                  {/* Output */}
                  <div className="text-label-3 dark:text-dark-label-3 text-xs font-medium">
                    Output
                  </div>
                  <div className="font-menlo bg-fill-3 dark:bg-dark-fill-3 w-full cursor-text rounded-lg border border-transparent px-3 py-[10px]">
                    <div className="font-menlo placeholder:text-label-4 dark:placeholder:text-dark-label-4 sentry-unmask w-full resize-none whitespace-pre-wrap break-words outline-none">
                      {assignment.output ?? "-"}
                    </div>
                  </div>

                  {/* Expected */}
                  <div className="text-label-3 dark:text-dark-label-3 text-xs font-medium">
                    Expected
                  </div>
                  <div className="font-menlo bg-fill-3 dark:bg-dark-fill-3 w-full cursor-text rounded-lg border border-transparent px-3 py-[10px]">
                    <div className="font-menlo placeholder:text-label-4 dark:placeholder:text-dark-label-4 sentry-unmask w-full resize-none whitespace-pre-wrap break-words outline-none">
                      {assignment.expected ?? "-"}
                    </div>
                  </div>
                </React.Fragment>
              )) ?? null}
            </div>
          </div>
        </div>
      </div>
    </SkeletonWrapper>
  );
};
