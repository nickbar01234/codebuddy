import { Timestamp } from "firebase/firestore";
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
  testInputs: TestCases,
  testOutputs: string[],
  testExpectedOutputs: string[]
): TestResult[] => {
  const numCases = testInputs.length;

  if (
    variables == undefined ||
    testInputs.length !== numCases ||
    testExpectedOutputs.length !== numCases
  ) {
    console.error(
      "Variables are undefined or tests do not match up",
      variables,
      testInputs,
      testOutputs,
      testExpectedOutputs
    );
    return [];
  }

  const results: TestResult[] = [];
  const varCount = variables?.count ?? 0;

  for (let curCaseNo = 0; curCaseNo < numCases; curCaseNo++) {
    if (testInputs[curCaseNo].test.length !== varCount) {
      console.error(
        `Case ${curCaseNo} does not have the correct number of variables`,
        variables,
        testInputs
      );
      return [];
    }

    const inputObj: Array<any> = [];
    const currentTestInputs = testInputs[curCaseNo];

    for (let v = 0; v < varCount; v++) {
      const name: string = currentTestInputs.test[v].variable ?? "";
      inputObj.push({
        variable: name,
        value: currentTestInputs.test[v].value,
      });
    }

    results.push({
      testResult: [
        {
          input: inputObj,
          output: testOutputs[curCaseNo] ?? "",
          expected: testExpectedOutputs[curCaseNo] ?? "",
        },
      ],
    });
  }

  return results;
};

export const safeJsonParse = (content: string): object => {
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to parse json", content, error);
    return {};
  }
};

export const formatTime = (timestamp?: Timestamp) => {
  if (!timestamp) return "";
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(timestamp.toDate());
};

export const testCaseToValues = (testCase: TestCase): string[] => {
  return testCase.test.map((assignment) => assignment.value);
};
