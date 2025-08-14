import { TestCase } from "@cb/types";

export const capitalize = (str: string | undefined) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

export const groupTestCases = (
  variables: string[],
  tests?: string[]
): TestCase[] => {
  const groups = (tests ?? []).reduce(
    (acc, test) => {
      // TODO(nickbar01234): Nasty implementation, but works
      const lastGroup = acc[acc.length - 1];
      if (lastGroup.length < variables.length) {
        lastGroup.push(test);
      } else {
        acc.push([test]);
      }
      return acc;
    },
    [[]] as Array<string[]>
  );
  return groups.map((group) => ({
    selected: false,
    test: group.map((assignment, idx) => ({
      variable: variables[idx],
      value: assignment,
    })),
  }));
};
