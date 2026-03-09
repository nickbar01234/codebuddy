import { DOM, TEST_RESULT_ERROR } from "@cb/constants";
import background from "@cb/services/background";
import { ExtractMessage, PeerMessage, Question } from "@cb/types";
import monaco from "monaco-editor";
import { getNormalizedUrl } from "./url";

export const getTestsPayload = (
  variables: Question["variables"] | undefined
): ExtractMessage<PeerMessage, "tests"> => {
  const testLines = [
    ...(document.querySelector(DOM.LEETCODE_TEST_ID)?.children ?? []),
  ].map((line) => (line as HTMLElement).innerText);
  return {
    action: "tests",
    tests: groupTestCases(variables, testLines),
    url: getNormalizedUrl(window.location.href),
  };
};

export const getTestResultsPayload = (
  variables: Question["variables"] | undefined,
  testResults?: any
): ExtractMessage<PeerMessage, "testResults"> => {
  if (!testResults) {
    return {
      action: "testResults",
      testResults: [],
      url: getNormalizedUrl(window.location.href),
    };
  }

  // Because statusMessage of invalid test case is the same as runtime error although they are handled differently
  const statusMsg: string = testResults.invalid_testcase
    ? "Invalid Test Case"
    : testResults.status_msg;

  return {
    action: "testResults",
    testResults: groupTestResults(
      variables,
      statusMsg,
      testResults.code_answer,
      testResults.case_idx + 1,
      getTestsPayload(variables).tests,
      testResults.code_answer?.slice(0, -1),
      testResults.expected_code_answer?.slice(0, -1),
      // To read the error message for invalid test case, runtime error, and compile error (empty for other test result statuses)
      statusMsg === "Invalid Test Case" ||
        statusMsg === "Runtime Error" ||
        statusMsg === "Compile Error"
        ? testResults[TEST_RESULT_ERROR[statusMsg]]
        : ""
    ),
    url: getNormalizedUrl(window.location.href),
  };
};

export const getCodePayload = async (
  changes: Partial<monaco.editor.IModelContentChange>
): Promise<ExtractMessage<PeerMessage, "code">> => {
  const { value, language } = await background.getCode({});
  return {
    action: "code",
    value,
    language,
    changes: JSON.stringify(changes),
    url: getNormalizedUrl(window.location.href),
  };
};
