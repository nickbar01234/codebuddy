import { DOM } from "@cb/constants";
import background from "@cb/services/background";
import { PeerMessage } from "@cb/types";
import monaco from "monaco-editor";
import { getUnixTs } from "./heartbeat";
import { constructUrlFromQuestionId, getQuestionIdFromUrl } from "./url";

export const getTestsPayload = (): PeerMessage => {
  return {
    action: "tests",
    timestamp: getUnixTs(),
    tests: (
      document.querySelector(DOM.LEETCODE_TEST_ID) as HTMLDivElement
    ).innerText.split("\n"),
  };
};

export const getCodePayload = async (
  changes: Partial<monaco.editor.IModelContentChange>
): Promise<PeerMessage> => {
  const { value, language } = await background.getCode({});
  return {
    action: "code",
    timestamp: getUnixTs(),
    value,
    language,
    changes: JSON.stringify(changes),
  };
};

export const getUrlPayload = (url: string): PeerMessage => {
  let normalizedUrl = url;
  try {
    const questionId = getQuestionIdFromUrl(url);
    normalizedUrl = constructUrlFromQuestionId(questionId);
  } catch (error) {
    console.warn("Failed to normalize URL:", url, error);
  }
  return {
    action: "url",
    url: normalizedUrl,
    timestamp: getUnixTs(),
  };
};
