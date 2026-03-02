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

// export const groupTestResults = (
//   variables: Question["variables"] | undefined,
//   testResultStatus: string,
//   codeAnswer: string[] = [],
//   testResultError: string = "",
//   invalidTestCaseIdx: number | undefined,
//   testInputs: TestCases,
//   testOutputs: string[],
//   testExpectedOutputs: string[],
// ): TestResults => {
//   const numCases = testInputs.length;

//   if (
//     variables == undefined ||
//     testInputs.length !== numCases ||
//     testExpectedOutputs.length !== numCases
//   ) {
//     console.error(
//       "Variables are undefined or tests do not match up",
//       variables,
//       testInputs,
//       testOutputs,
//       testExpectedOutputs
//     );
//     return {
//       testResultStatus: testResultStatus,
//       testResults: [],
//     };
//   }

//   const results: TestResult[] = [];
//   const varCount = variables?.count ?? 0;

//   for (let curCaseNo = 0; curCaseNo < numCases; curCaseNo++) {
//     if (testInputs[curCaseNo].test.length !== varCount) {
//       console.error(
//         `Case ${curCaseNo} does not have the correct number of variables`,
//         variables,
//         testInputs
//       );
//       return {
//         testResultStatus: testResultStatus,
//         testResults: [],
//       };
//     }

//     switch (testResultStatus) {
//       case "Time Limit Exceeded":
//       case "Memory Limit Exceeded":
//       case "Output Limit Exceeded":
//         let lastTestCaseRunIdx = 0;
//         let i = 0;
//         while (i < codeAnswer.length && codeAnswer[i] === "0") {
//           lastTestCaseRunIdx++;
//           i++;
//         }
//         return {
//           testResultStatus: testResultStatus,
//           lastTestCaseRun: lastTestCaseRunIdx,
//           testResults: [],
//         };
//       case "Runtime Error":
//       case "Compile Error":
//         let lastTestCaseRunIdx = 0;
//         let i = 0;
//         while (i < codeAnswer.length && codeAnswer[i] === "0") {
//           lastTestCaseRunIdx++;
//           i++;
//         }
//         return {
//           testResultStatus: testResultStatus,
//           errorMessage: testResultError,
//           lastTestCaseRun: lastTestCaseRunIdx,
//           testResults: [],
//         };
//       case "Invalid Testcase":
//         return {
//           testResultStatus: testResultStatus,
//           errorMessage: testResultError,
//           invalidTestCaseIdx: invalidTestCaseIdx,
//           testResults: [],
//         };
//       case "Accepted":
//         const inputObj: Array<any> = [];
//         const currentTestInputs = testInputs[curCaseNo];

//         for (let v = 0; v < varCount; v++) {
//           const name: string = currentTestInputs.test[v].variable ?? "";
//           inputObj.push({
//             variable: name,
//             value: currentTestInputs.test[v].value,
//           });
//         }

//         results.push({
//           testResult: [
//             {
//               input: inputObj,
//               output: testOutputs[curCaseNo] ?? "",
//               expected: testExpectedOutputs[curCaseNo] ?? "",
//             },
//           ],
//         });

//       return {
//         testResultStatus: testResultStatus,
//         testResults: results,
//       };

//       default:
//         break;
//     }
// };

export const groupTestResults = (
  variables: Question["variables"] | undefined,
  testResultStatus: string,
  codeAnswer: string[] = [],
  invalidTestCaseIdx: number | undefined,
  testInputs: TestCases,
  testOutputs: string[],
  testExpectedOutputs: string[],
  testResultError: string = ""
): TestResult[] => {
  const numCases = testInputs.length;
  const varCount = variables?.count ?? 0;

  const baseResponse = (overrides: Partial<TestResult> = {}): TestResult => ({
    testResultStatus,
    testResult: [],
    ...overrides,
  });

  const getLastRunIndex = () =>
    codeAnswer.findIndex((val) => val !== "0") === -1
      ? codeAnswer.length
      : codeAnswer.findIndex((val) => val !== "0");

  // Validation
  if (!variables || testExpectedOutputs.length !== numCases) {
    console.error(
      "Variables undefined or test lengths mismatch",
      variables,
      testInputs,
      testOutputs,
      testExpectedOutputs
    );
    return [baseResponse()];
  }

  // Global error states (no need to iterate test cases)
  if (
    [
      "Time Limit Exceeded",
      "Memory Limit Exceeded",
      "Output Limit Exceeded",
    ].includes(testResultStatus)
  ) {
    return [
      baseResponse({
        lastTestCaseRun: getLastRunIndex(),
      }),
    ];
  }

  if (["Runtime Error", "Compile Error"].includes(testResultStatus)) {
    return [
      baseResponse({
        errorMessage: testResultError,
        lastTestCaseRun: getLastRunIndex(),
      }),
    ];
  }

  if (testResultStatus === "Invalid Testcase") {
    return [
      baseResponse({
        errorMessage: testResultError,
        invalidTestCaseIdx,
      }),
    ];
  }

  // Accepted case
  if (testResultStatus === "Accepted") {
    const results: TestResult[] = [];

    for (let i = 0; i < numCases; i++) {
      const currentTest = testInputs[i];

      if (currentTest.test.length !== varCount) {
        console.error(
          `Case ${i} does not match expected variable count`,
          variables,
          testInputs
        );
        return [baseResponse()];
      }

      const input = currentTest.test.map((t) => ({
        variable: t.variable ?? "",
        value: t.value,
      }));

      results.push({
        testResultStatus,
        testResult: [
          {
            input,
            output: testOutputs[i] ?? "",
            expected: testExpectedOutputs[i] ?? "",
          },
        ],
      });
    }

    return results;
  }

  return [baseResponse()];
};

export const safeJsonParse = (content: string): object => {
  try {
    return JSON.parse(content);
  } catch (error) {
    console.error("Failed to parse json", content, error);
    return {};
  }
};
