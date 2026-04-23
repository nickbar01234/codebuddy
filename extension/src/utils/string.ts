import { Question, TestCase, TestCases, TestResult } from "@cb/types";

export const capitalize = (str: string | undefined) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

export const groupTestCases = (
  variables: Question["variables"] | undefined,
  tests: string[]
): TestCase[] => {
  if (variables == undefined || tests.length % variables.count !== 0) {
    console.error(
      "Variables are undefined or tests do not match up",
      variables,
      tests
    );
    return [];
  }

  const chunks = tests.length / variables.count;
  const groups = Array.from({ length: chunks }, (_, idx) =>
    tests.slice(idx * variables.count, (idx + 1) * variables.count)
  );
  return groups.map((group) => ({
    test: group.map((assignment, idx) => ({
      variable: variables.names[idx],
      value: assignment,
    })),
  }));
};

export const groupTestResults = (
  variables: Question["variables"] | undefined,
  testResultStatus: string,
  codeAnswer: string[] = [],
  invalidTestCaseIdx: number | undefined,
  testInputs: TestCases,
  testOutputs: string[] = [],
  testExpectedOutputs: string[] = [],
  testResultError: string = ""
): TestResult[] => {
  const numCases = testInputs.length;
  const varCount = variables?.count ?? 0;
  const results: TestResult[] = [];

  const getLastRunIndex = () =>
    codeAnswer.findIndex((val) => val !== "0") === -1
      ? codeAnswer.length
      : codeAnswer.findIndex((val) => val !== "0");

  const getFirstInput = () => {
    if (numCases === 0) return [];
    const firstTest = testInputs[0];
    if (firstTest.test.length !== varCount) return [];
    return firstTest.test.map((t) => ({
      variable: t.variable ?? "",
      value: t.value,
    }));
  };

  const createErrorResponse = (
    overrides: Partial<TestResult> = {}
  ): TestResult => ({
    testResultStatus,
    testResult: { input: getFirstInput(), output: "", expected: "" },
    ...overrides,
  });

  if (
    [
      "Time Limit Exceeded",
      "Memory Limit Exceeded",
      "Output Limit Exceeded",
    ].includes(testResultStatus)
  ) {
    return [createErrorResponse({ lastTestCaseRun: getLastRunIndex() })];
  }

  if (testResultStatus === "Runtime Error") {
    return [
      createErrorResponse({
        errorMessage: testResultError,
        lastTestCaseRun: getLastRunIndex(),
      }),
    ];
  }

  if (testResultStatus === "Compile Error") {
    return [createErrorResponse({ errorMessage: testResultError })];
  }

  if (testResultStatus === "Invalid Test Case") {
    return [
      createErrorResponse({
        errorMessage: testResultError,
        invalidTestCaseIdx,
      }),
    ];
  }

  // Determine overall status before looping
  const allMatch = testOutputs.every(
    (output, i) => output === testExpectedOutputs[i]
  );
  const overallStatus = allMatch ? "Accepted" : "Wrong Answer";

  // Only loop for Accepted cases
  for (let i = 0; i < numCases; i++) {
    const currentTest = testInputs[i];

    if (currentTest.test.length !== varCount) {
      console.error(
        `Case ${i} does not match expected variable count`,
        variables,
        testInputs
      );
      return [
        { testResultStatus, testResult: createErrorResponse().testResult },
      ]; // Return with empty test result on error
    }

    const input = currentTest.test.map((t) => ({
      variable: t.variable ?? "",
      value: t.value,
    }));

    results.push({
      testResultStatus: overallStatus,
      testResult: {
        input,
        output: testOutputs[i] ?? "",
        expected: testExpectedOutputs[i] ?? "",
      },
    });
  }

  return results.length > 0
    ? results
    : [{ testResultStatus, testResult: createErrorResponse().testResult }];
};

export const safeJsonParse = (content: string): object => {
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to parse json", content, error);
    return {};
  }
};
