import React from "react";
import { LastExecutedInput } from "./base";
import { TestResultContentProps } from "./types";

export const TimeLimitExceededResult: React.FC<TestResultContentProps> = ({
  activeTestResult,
}) => {
  return (
    <div className="space-y-4 pb-12">
      <LastExecutedInput activeTestResult={activeTestResult} />
    </div>
  );
};
