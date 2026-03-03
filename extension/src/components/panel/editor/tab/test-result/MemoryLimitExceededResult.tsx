import { TestResult } from "@cb/types";
import React from "react";
import { TestResultContentProps } from "./types";

export const MemoryLimitExceededResult: React.FC<TestResultContentProps> = ({
  activeTestResult,
}) => {
  return (
    <div className="space-y-4 pb-12">
      <div className="text-label-3 dark:text-dark-label-3 text-xs font-medium">
        Memory Limit Exceeded
      </div>
      <div className="font-menlo bg-fill-3 dark:bg-dark-fill-3 w-full cursor-text rounded-lg border border-transparent px-3 py-[10px]">
        <div className="font-menlo placeholder:text-label-4 dark:placeholder:text-dark-label-4 sentry-unmask w-full resize-none whitespace-pre-wrap break-words outline-none">
          {(activeTestResult as TestResult).errorMessage}
        </div>
      </div>
    </div>
  );
};
