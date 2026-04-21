import { ResultAssignment } from "@cb/types";
import React from "react";
import { TestResultContentProps } from "./types";

export const WrongAnswerResult: React.FC<TestResultContentProps> = ({
  activeTestResult,
}) => {
  return (
    <div className="space-y-4 pb-12">
      <div>
        <div className="flex h-full w-full flex-col space-y-2">
          {activeTestResult.testResult?.map(
            (testResult: ResultAssignment, testIdx: number) => (
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

                {/* Output */}
                <div className="text-label-3 dark:text-dark-label-3 text-xs font-medium">
                  Output
                </div>
                <div className="font-menlo bg-fill-3 dark:bg-dark-fill-3 w-full cursor-text rounded-lg border border-transparent px-3 py-[10px]">
                  <div className="font-menlo placeholder:text-label-4 dark:placeholder:text-dark-label-4 sentry-unmask w-full resize-none whitespace-pre-wrap break-words outline-none">
                    {testResult.output ?? "-"}
                  </div>
                </div>

                {/* Expected */}
                <div className="text-label-3 dark:text-dark-label-3 text-xs font-medium">
                  Expected
                </div>
                <div className="font-menlo bg-fill-3 dark:bg-dark-fill-3 w-full cursor-text rounded-lg border border-transparent px-3 py-[10px]">
                  <div className="font-menlo placeholder:text-label-4 dark:placeholder:text-dark-label-4 sentry-unmask w-full resize-none whitespace-pre-wrap break-words outline-none">
                    {testResult.expected ?? "-"}
                  </div>
                </div>
              </React.Fragment>
            )
          ) ?? null}
        </div>
      </div>
    </div>
  );
};
