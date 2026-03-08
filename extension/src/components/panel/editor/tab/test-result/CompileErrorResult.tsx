import { TestResult } from "@cb/types";
import React from "react";
import { TestResultContentProps } from "./types";

export const CompileErrorResult: React.FC<TestResultContentProps> = ({
  activeTestResult,
}) => {
  return (
    <div className="space-y-4 pb-12">
      <div className="text-label-3 dark:text-dark-label-3 text-xs font-medium">
        Compile Error
      </div>
      <div className="bg-[#282120] text-[#ef7d6d] font-mono p-4 rounded-md text-sm leading-relaxed">
        {(activeTestResult as TestResult).errorMessage}
      </div>
    </div>
  );
};
