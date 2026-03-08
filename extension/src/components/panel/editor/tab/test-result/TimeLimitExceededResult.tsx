import React from "react";
import { TestResultContentProps } from "./types";

export const TimeLimitExceededResult: React.FC<TestResultContentProps> = ({
  activeTestResult,
}) => {
  return (
    <div className="space-y-4 pb-12">
      <div className="text-label-3 dark:text-dark-label-3 text-xs font-medium">
        Last Executed Input
      </div>
      <div className="font-menlo bg-fill-3 dark:bg-dark-fill-3 w-full cursor-text rounded-lg border border-transparent px-3 py-[10px]">
        <div className="font-menlo placeholder:text-label-4 dark:placeholder:text-dark-label-4 sentry-unmask w-full resize-none whitespace-pre-wrap break-words outline-none">
          {activeTestResult.testResult[
            activeTestResult.lastTestCaseRun
              ? activeTestResult.lastTestCaseRun
              : 0
          ]?.input.map((input, idx) => (
            <div key={idx}>
              {input.variable
                ? `${input.variable}=${input.value}`
                : input.value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
