import { Question, TestCase } from "@cb/types";

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

export const safeJsonParse = (content: string): object => {
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to parse json", content, error);
    return {};
  }
};
