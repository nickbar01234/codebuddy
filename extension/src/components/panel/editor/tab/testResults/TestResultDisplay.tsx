import { SelectableTestResult } from "@cb/types";
import React from "react";
import { ExpectedDisplay, InputDisplay, OutputDisplay } from "./base";

interface TestResultDisplayProps {
  activeTestResult: SelectableTestResult;
  testCaseIdx: number | undefined;
}

export const TestResultDisplay: React.FC<TestResultDisplayProps> = ({
  activeTestResult,
  testCaseIdx,
}) => {
  return (
    <div className="space-y-4 pb-12">
      <div>
        <div className="flex h-full w-full flex-col space-y-2">
          {activeTestResult && (
            <React.Fragment key={testCaseIdx}>
              {Array.isArray(activeTestResult.testResult.input) && (
                <InputDisplay inputs={activeTestResult.testResult.input} />
              )}
              <OutputDisplay output={activeTestResult.testResult.output} />
              <ExpectedDisplay
                expected={activeTestResult.testResult.expected}
              />
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  );
};
