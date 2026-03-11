import checkIcon from "@cb/assets/accepted_icon.png";
import xIcon from "@cb/assets/wrong_answer_icon.png";
import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { useRoomData } from "@cb/hooks/store";
import {
  Identifiable,
  PeerState,
  ResultAssignment,
  SelectableTestResult,
} from "@cb/types";
import React from "react";
import {
  CompileErrorResult,
  InvalidTestCaseResult,
  MemoryLimitExceededResult,
  RuntimeErrorResult,
  TestResultDisplay,
  TestResultStatus,
  TimeLimitExceededResult,
} from "./testResultComponents";

const STATUS_CONFIG: Record<
  TestResultStatus,
  { label: string; className: string }
> = {
  Accepted: { label: "Accepted", className: "text-green-500" },
  "Wrong Answer": { label: "Wrong Answer", className: "text-red-500" },
  "Time Limit Exceeded": {
    label: "Time Limit Exceeded",
    className: "text-red-500",
  },
  "Invalid Test Case": {
    label: "Invalid Test Case",
    className: "text-red-500",
  },
  "Runtime Error": { label: "Runtime Error", className: "text-red-500" },
  "Compile Error": { label: "Compile Error", className: "text-red-500" },
  "Memory Limit Exceeded": {
    label: "Memory Limit Exceeded",
    className: "text-red-500",
  },
};

const renderTestResultContent = (activeTestResult: SelectableTestResult) => {
  const status = activeTestResult.testResultStatus as TestResultStatus;

  switch (status) {
    case "Accepted":
      return <TestResultDisplay activeTestResult={activeTestResult} />;
    case "Wrong Answer":
      return <TestResultDisplay activeTestResult={activeTestResult} />;
    case "Compile Error":
      return <CompileErrorResult activeTestResult={activeTestResult} />;
    case "Runtime Error":
      return <RuntimeErrorResult activeTestResult={activeTestResult} />;
    case "Time Limit Exceeded":
      return <TimeLimitExceededResult activeTestResult={activeTestResult} />;
    case "Memory Limit Exceeded":
      return <MemoryLimitExceededResult activeTestResult={activeTestResult} />;
    case "Invalid Test Case":
      return <InvalidTestCaseResult activeTestResult={activeTestResult} />;
    default:
      return null;
  }
};

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
  const { self } = useRoomData();
  const testResults = activePeer?.questions[self?.url ?? ""]?.testResults ?? [];

  const getStatusBadge = (status: TestResultStatus) => {
    const config = STATUS_CONFIG[status] ?? {
      label: status,
      className: "text-label-1 dark:text-dark-label-1",
    };
    return <span className={config.className}>{config.label}</span>;
  };

  return (
    <SkeletonWrapper loading={false} className="relative">
      <div className="p-5 flex flex-col space-y-4 h-full w-full overflow-scroll hide-scrollbar">
        <div className="flex w-full flex-col items-start justify-between gap-4">
          <div className="text-label-1 dark:text-dark-label-1 text-xl">
            {activeTestResult &&
              getStatusBadge(
                activeTestResult.testResultStatus as TestResultStatus
              )}
          </div>
          <div className="hide-scrollbar flex flex-nowrap items-center gap-x-2 gap-y-4 overflow-x-scroll">
            {(activeTestResult?.testResultStatus === "Accepted" ||
              activeTestResult?.testResultStatus === "Wrong Answer") &&
              testResults.map((test: SelectableTestResult, idx: number) => {
                const passed = (test.testResult ?? []).every(
                  (r: ResultAssignment) => r.output === r.expected
                );
                const selected = !!test.selected;
                const baseClasses =
                  "relative inline-flex items-center whitespace-nowrap rounded-lg px-4 py-1 text-sm font-semibold focus:outline-none";
                const selectedClasses =
                  "bg-fill-3 dark:bg-dark-fill-3 hover:bg-fill-2 dark:hover:bg-dark-fill-2 hover:text-label-1 dark:hover:text-dark-label-1 text-label-1 dark:text-dark-label-1";
                const unselectedClasses =
                  "hover:bg-fill-2 dark:hover:bg-dark-fill-2 text-label-2 dark:text-dark-label-2 hover:text-label-1 dark:hover:text-dark-label-1 dark:bg-dark-transparent bg-transparent";
                return (
                  <div key={idx} onClick={() => selectTestResult(idx)}>
                    <button
                      className={`${baseClasses} ${selected ? selectedClasses : unselectedClasses} gap-2`}
                    >
                      <img
                        src={passed ? checkIcon : xIcon}
                        alt={passed ? "passed" : "failed"}
                        className="w-3 h-3 rounded-sm"
                      />
                      Case {idx + 1}
                    </button>
                  </div>
                );
              })}
          </div>
        </div>
        {activeTestResult && renderTestResultContent(activeTestResult)}
      </div>
    </SkeletonWrapper>
  );
};
