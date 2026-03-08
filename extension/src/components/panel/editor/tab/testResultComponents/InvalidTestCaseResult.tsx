import React from "react";
import { ErrorMessage } from "./sharedComponents";
import { TestResultContentProps } from "./types";

export const InvalidTestCaseResult: React.FC<TestResultContentProps> = ({
  activeTestResult,
}) => {
  return (
    <div className="space-y-4 pb-12">
      <div className="text-label-3 dark:text-dark-label-3 text-xs font-medium">
        Case {activeTestResult.invalidTestCaseIdx}
      </div>
      <ErrorMessage message={activeTestResult.errorMessage} />
    </div>
  );
};
