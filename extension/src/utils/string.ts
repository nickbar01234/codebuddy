import { TestCase } from "@cb/types";

export const capitalize = (str: string | undefined) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

export const groupTestCases = (
  variables: string[],
  tests: string[]
): TestCase[] => {
  if (tests.length % variables.length !== 0) {
    return [];
  }
  const chunks = tests.length / variables.length;
  const groups = Array.from({ length: chunks }, (_, idx) =>
    tests.slice(idx * variables.length, (idx + 1) * variables.length)
  );
  return groups.map((group) => ({
    test: group.map((assignment, idx) => ({
      variable: variables[idx],
      value: assignment,
    })),
  }));
};

export const inferVariablesFromGraphql = (content: string) => {
  const pattern = /Input:\s*([^<\n\r]+?)\s*Output:/gs;
  // Replace any html tag before matching
  const match = content.replace(/<[^>]+>/g, "").match(pattern);
  if (match != null) {
    return Array.from(match[1].matchAll(/\b([a-zA-Z_]\w*)\s*=/g), (v) => v[1]);
  }
  return [];
};
