import React from "react";
import { ErrorMessage, LastExecutedInput } from "./base";
import { TestResultContentProps } from "./types";

export const RuntimeErrorResult: React.FC<TestResultContentProps> = ({
  activeTestResult,
}) => {
  return (
    <div className="space-y-4 pb-12">
      <ErrorMessage message={activeTestResult.errorMessage} />
      <LastExecutedInput activeTestResult={activeTestResult} />
    </div>
  );
};
