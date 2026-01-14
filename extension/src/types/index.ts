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

export interface TestCase {
  test: Assignment[];
}

export type TestCases = TestCase[];

export interface SelectableTestCase extends TestCase, Selectable {}

// Refactor post redux
export interface LocalStorage {
  signIn: {
    email: string;
    url: string;
    tabId: number;
  };
}
