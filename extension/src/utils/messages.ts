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

  const statusMsg: string = testResults.invalid_testcase
    ? "Invalid Testcase"
    : testResults.status_msg;

  return {
    action: "testResults",
    testResults: groupTestResults(
      variables,
      statusMsg,
      testResults.code_answer,
      testResults.invalid_testcase_idx,
      getTestsPayload(variables).tests,
      testResults.code_answer?.slice(0, -1),
      testResults.expected_code_answer?.slice(0, -1),
      statusMsg === "Invalid Testcase" ||
        statusMsg === "Runtime Error" ||
        statusMsg === "Compile Error"
        ? TEST_RESULT_ERROR[statusMsg as keyof typeof TEST_RESULT_ERROR]
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
