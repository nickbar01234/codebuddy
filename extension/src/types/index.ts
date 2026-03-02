import { Selectable } from "./utils";

export * from "./content";
export * from "./db";
export * from "./events";
export * from "./peers";
export * from "./services";
export * from "./store";
export * from "./utils";
export * from "./webrtc";
export * from "./window";

interface Assignment {
  variable?: string;
  value: string;
}

export interface ResultAssignment {
  input: Assignment[];
  output: string;
  expected: string;
}

export interface TestCase {
  test: Assignment[];
}

export interface TestResult {
  testResultStatus:
    | "Unexamined"
    | "Accepted"
    | "Unknown Error"
    | "Runtime Error"
    | "Time Limit Exceeded"
    | "Memory Limit Exceeded"
    | "Output Limit Exceeded"
    | "Compile Error"
    | "Invalid Testcase"
    | string;
  errorMessage?: string;
  lastTestCaseRun?: number;
  invalidTestCaseIdx?: number;
  testResult: ResultAssignment[];
}

export type TestCases = TestCase[];

export type TestResults = TestResult[];

export interface SelectableTestCase extends TestCase, Selectable {}

export interface SelectableTestResult extends TestResult, Selectable {}

// Refactor post redux
export interface LocalStorage {
  signIn: {
    email: string;
    url: string;
    tabId: number;
  };
}
