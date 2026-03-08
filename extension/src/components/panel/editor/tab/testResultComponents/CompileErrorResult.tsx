import React from "react";
import { ErrorMessage } from "./sharedComponents";
import { TestResultContentProps } from "./types";

export const CompileErrorResult: React.FC<TestResultContentProps> = ({
  activeTestResult,
}) => {
  return (
    <div className="space-y-4 pb-12">
      <ErrorMessage message={activeTestResult.errorMessage} />
    </div>
  );
};
