import { SelectableTestResult } from "@cb/types";
import React from "react";

interface ErrorMessageProps {
  message: string | undefined;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="bg-[#282120] text-[#ef7d6d] font-mono p-4 rounded-md text-xs leading-relaxed whitespace-pre-wrap">
    {message}
  </div>
);

interface InputDisplayProps {
  inputs: { variable?: string; value: string }[];
}

export const InputDisplay: React.FC<InputDisplayProps> = ({ inputs }) => (
  <>
    <div className="text-label-3 dark:text-dark-label-3 text-xs font-medium">
      Input
    </div>
    {inputs.map((input, idx) => (
      <div
        key={idx}
        className="font-menlo bg-fill-3 dark:bg-dark-fill-3 w-full cursor-text rounded-lg border border-transparent px-3 py-[10px]"
      >
        <div className="font-menlo placeholder:text-label-4 dark:placeholder:text-dark-label-4 sentry-unmask w-full resize-none whitespace-pre-wrap break-words outline-none">
          {input.variable ? (
            <>
              <div className="text-gray-400">{input.variable}=</div>
              {input.value}
            </>
          ) : (
            input.value
          )}
        </div>
      </div>
    ))}
  </>
);

interface OutputDisplayProps {
  output: string | undefined;
}

export const OutputDisplay: React.FC<OutputDisplayProps> = ({ output }) => (
  <>
    <div className="text-label-3 dark:text-dark-label-3 text-xs font-medium">
      Output
    </div>
    <div className="font-menlo bg-fill-3 dark:bg-dark-fill-3 w-full cursor-text rounded-lg border border-transparent px-3 py-[10px]">
      <div className="font-menlo placeholder:text-label-4 dark:placeholder:text-dark-label-4 sentry-unmask w-full resize-none whitespace-pre-wrap break-words outline-none">
        {output ?? "-"}
      </div>
    </div>
  </>
);

interface ExpectedDisplayProps {
  expected: string | undefined;
}

export const ExpectedDisplay: React.FC<ExpectedDisplayProps> = ({
  expected,
}) => (
  <>
    <div className="text-label-3 dark:text-dark-label-3 text-xs font-medium">
      Expected
    </div>
    <div className="font-menlo bg-fill-3 dark:bg-dark-fill-3 w-full cursor-text rounded-lg border border-transparent px-3 py-[10px]">
      <div className="font-menlo placeholder:text-label-4 dark:placeholder:text-dark-label-4 sentry-unmask w-full resize-none whitespace-pre-wrap break-words outline-none">
        {expected ?? "-"}
      </div>
    </div>
  </>
);

interface LastExecutedInputProps {
  activeTestResult: SelectableTestResult;
}

export const LastExecutedInput: React.FC<LastExecutedInputProps> = ({
  activeTestResult,
}) => {
  const lastIndex = activeTestResult.lastTestCaseRun ?? 0;
  const inputs = activeTestResult.testResult[lastIndex]?.input ?? [];

  return (
    <>
      <div className="text-label-3 dark:text-dark-label-3 text-xs font-medium">
        Last Executed Input
      </div>
      <div className="font-menlo bg-fill-3 dark:bg-dark-fill-3 w-full cursor-text rounded-lg border border-transparent px-3 py-[10px]">
        <div className="font-menlo placeholder:text-label-4 dark:placeholder:text-dark-label-4 sentry-unmask w-full resize-none whitespace-pre-wrap break-words outline-none">
          {inputs.map((input, idx) => (
            <div key={idx}>
              {input.variable ? (
                <>
                  <div className="text-gray-400">{input.variable}=</div>
                  {input.value}
                </>
              ) : (
                input.value
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};
