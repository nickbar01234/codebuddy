import { ResultAssignment, SelectableTestResult } from "@cb/types";
import React from "react";
import { ExpectedDisplay, InputDisplay, OutputDisplay } from "./base";

interface TestResultDisplayProps {
  activeTestResult: SelectableTestResult;
}

export const TestResultDisplay: React.FC<TestResultDisplayProps> = ({
  activeTestResult,
}) => {
  return (
    <div className="space-y-4 pb-12">
      <div>
        <div className="flex h-full w-full flex-col space-y-2">
          {activeTestResult.testResult?.map(
            (testResult: ResultAssignment, testIdx: number) => (
              <React.Fragment key={testIdx}>
                {Array.isArray(testResult.input) && (
                  <InputDisplay inputs={testResult.input} />
                )}
                <OutputDisplay output={testResult.output} />
                <ExpectedDisplay expected={testResult.expected} />
              </React.Fragment>
            )
          ) ?? null}
        </div>
      </div>
    </div>
  );
};
