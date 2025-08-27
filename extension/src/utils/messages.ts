import { DOM } from "@cb/constants";
import background from "@cb/services/background";
import { PeerMessage } from "@cb/types";
import monaco from "monaco-editor";
import { getUnixTs } from "./heartbeat";

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

export const getUrlPayload = (url: string): PeerMessage => ({
  action: "url",
  url,
  timestamp: getUnixTs(),
});
