import { TestCase } from "@cb/types";

export const capitalize = (str: string | undefined) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

export const groupTestCases = (
  variables: string[],
  tests: string[]
): TestCase[] => {
  if (variables.length % tests.length !== 0) {
    return [];
  }
  const chunks = tests.length / variables.length;
  const groups = Array.from({ length: chunks }, (_, idx) =>
    tests.slice(idx * chunks, (idx + 1) * chunks)
  );
  return groups.map((group) => ({
    selected: false,
    test: group.map((assignment, idx) => ({
      variable: variables[idx],
      value: assignment,
    })),
  }));
};
