import type { TestResultStatus } from "@cb/constants";
import { SelectableTestResult } from "@cb/types";

export type { TestResultStatus };

export interface TestResultContentProps {
  activeTestResult: SelectableTestResult;
}
