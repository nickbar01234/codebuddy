import { SelectableTestResult } from "@cb/types";

export type TestResultStatus =
  | "Accepted"
  | "Wrong Answer"
  | "Time Limit Exceeded"
  | "Runtime Error"
  | "Compile Error"
  | "Memory Limit Exceeded"
  | "Invalid Test Case";

export interface TestResultContentProps {
  activeTestResult: SelectableTestResult;
}
