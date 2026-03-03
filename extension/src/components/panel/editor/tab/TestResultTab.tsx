import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { useRoomData } from "@cb/hooks/store";
import {
  Identifiable,
  PeerState,
  ResultAssignment,
  SelectableTestResult,
} from "@cb/types";
import React from "react";

interface TestResultTabProps {
  activePeer: Identifiable<PeerState> | undefined;
  activeTestResult: SelectableTestResult | undefined;
  selectTestResult: (index: number) => void;
}

type TestResultStatus =
  | "Accepted"
  | "Wrong Answer"
  | "Time Limit Exceeded"
  | "Runtime Error"
  | "Compile Error"
  | "Memory Limit Exceeded";

const STATUS_CONFIG: Record<
  TestResultStatus,
  { label: string; className: string }
> = {
  Accepted: { label: "Accepted", className: "text-green-500" },
  "Wrong Answer": { label: "Wrong Answer", className: "text-red-500" },
  "Time Limit Exceeded": {
    label: "Time Limit Exceeded",
    className: "text-yellow-500",
  },
  "Runtime Error": { label: "Runtime Error", className: "text-red-500" },
  "Compile Error": { label: "Compile Error", className: "text-red-500" },
  "Memory Limit Exceeded": {
    label: "Memory Limit Exceeded",
    className: "text-yellow-500",
  },
};

const StatusBadge: React.FC<{ status: TestResultStatus }> = ({ status }) => {
  const config = STATUS_CONFIG[status] ?? {
    label: status,
    className: "text-label-1 dark:text-dark-label-1",
  };
  return <span className={config.className}>{config.label}</span>;
};

interface CaseButtonProps {
  idx: number;
  passed: boolean;
  selected: boolean;
  onClick: () => void;
}

const CaseButton: React.FC<CaseButtonProps> = ({
  idx,
  passed,
  selected,
  onClick,
}) => {
  const baseClasses =
    "relative inline-flex items-center whitespace-nowrap rounded-lg px-4 py-1 text-sm font-semibold focus:outline-none";
  const selectedClasses =
    "bg-fill-3 dark:bg-dark-fill-3 hover:bg-fill-2 dark:hover:bg-dark-fill-2 hover:text-label-1 dark:hover:text-dark-label-1 text-label-1 dark:text-dark-label-1";
  const unselectedClasses =
    "hover:bg-fill-2 dark:hover:bg-dark-fill-2 text-label-2 dark:text-dark-label-2 hover:text-label-1 dark:hover:text-dark-label-1 dark:bg-dark-transparent bg-transparent";

  return (
    <div onClick={onClick}>
      <button
        className={`${baseClasses} ${selected ? selectedClasses : unselectedClasses}`}
      >
        {passed ? "V" : "X"} Case {idx + 1}
      </button>
    </div>
  );
};

const ResultField: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <>
    <div className="text-label-3 dark:text-dark-label-3 text-xs font-medium">
      {label}
    </div>
    <div className="font-menlo bg-fill-3 dark:bg-dark-fill-3 w-full cursor-text rounded-lg border border-transparent px-3 py-[10px]">
      <div className="font-menlo placeholder:text-label-4 dark:placeholder:text-dark-label-4 sentry-unmask w-full resize-none whitespace-pre-wrap break-words outline-none">
        {value}
      </div>
    </div>
  </>
);

const TestResultContent: React.FC<{
  activeTestResult: SelectableTestResult;
}> = ({ activeTestResult }) => {
  const status = activeTestResult.testResultStatus as TestResultStatus;

  // For compile errors, show error message instead of test cases
  if (status === "Compile Error") {
    return (
      <div className="space-y-4 pb-12">
        <ResultField
          label="Error"
          value={activeTestResult.errorMessage ?? "Compilation failed"}
        />
      </div>
    );
  }

  // For runtime errors, show error with partial results if available
  if (status === "Runtime Error") {
    return (
      <div className="space-y-4 pb-12">
        <ResultField
          label="Error"
          value={activeTestResult.errorMessage ?? "Runtime error occurred"}
        />
        {activeTestResult.testResult?.length > 0 && (
          <TestCaseResults testResults={activeTestResult.testResult} />
        )}
      </div>
    );
  }

  // Default: show test case results (Accepted, Wrong Answer, TLE, MLE)
  return (
    <div className="space-y-4 pb-12">
      <TestCaseResults testResults={activeTestResult.testResult ?? []} />
    </div>
  );
};

const TestCaseResults: React.FC<{ testResults: ResultAssignment[] }> = ({
  testResults,
}) => (
  <div>
    <div className="flex h-full w-full flex-col space-y-2">
      {testResults.map((testResult, testIdx) => (
        <React.Fragment key={testIdx}>
          <div className="text-label-3 dark:text-dark-label-3 text-xs font-medium">
            Input
          </div>
          {Array.isArray(testResult.input) &&
            testResult.input.map((input, idx) => (
              <React.Fragment key={idx}>
                <div className="font-menlo bg-fill-3 dark:bg-dark-fill-3 w-full cursor-text rounded-lg border border-transparent px-3 py-[10px]">
                  <div className="font-menlo placeholder:text-label-4 dark:placeholder:text-dark-label-4 sentry-unmask w-full resize-none whitespace-pre-wrap break-words outline-none">
                    {input.variable
                      ? `${input.variable}=${input.value}`
                      : input.value}
                  </div>
                </div>
              </React.Fragment>
            ))}
          <ResultField label="Output" value={testResult.output ?? "-"} />
          <ResultField label="Expected" value={testResult.expected ?? "-"} />
        </React.Fragment>
      ))}
    </div>
  </div>
);

export const TestResultTab: React.FC<TestResultTabProps> = ({
  activePeer,
  activeTestResult,
  selectTestResult,
}) => {
  const { self } = useRoomData();
  const testResults = activePeer?.questions[self?.url ?? ""]?.testResults ?? [];

  return (
    <SkeletonWrapper loading={false} className="relative">
      <div className="p-5 flex flex-col space-y-4 h-full w-full overflow-scroll hide-scrollbar">
        <div className="flex w-full flex-col items-start justify-between gap-4">
          <div className="text-label-1 dark:text-dark-label-1 text-xl">
            {activeTestResult && (
              <StatusBadge
                status={activeTestResult.testResultStatus as TestResultStatus}
              />
            )}
          </div>
          <div className="hide-scrollbar flex flex-nowrap items-center gap-x-2 gap-y-4 overflow-x-scroll">
            {testResults.map((test: SelectableTestResult, idx: number) => {
              const passed = (test.testResult ?? []).every(
                (r: ResultAssignment) => r.output === r.expected
              );
              return (
                <CaseButton
                  key={idx}
                  idx={idx}
                  passed={passed}
                  selected={!!test.selected}
                  onClick={() => selectTestResult(idx)}
                />
              );
            })}
          </div>
        </div>
        {activeTestResult && (
          <TestResultContent activeTestResult={activeTestResult} />
        )}
      </div>
    </SkeletonWrapper>
  );
};
