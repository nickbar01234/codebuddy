import { DOM } from "@cb/constants";
import background from "@cb/services/background";
import { ExtractMessage, PeerMessage } from "@cb/types";
import monaco from "monaco-editor";
import { getNormalizedUrl } from "./url";

export const getTestsPayload = (
  variables: string[]
): ExtractMessage<PeerMessage, "tests"> => {
  return {
    action: "tests",
    tests: groupTestCases(
      variables,
      (
        document.querySelector(DOM.LEETCODE_TEST_ID) as HTMLElement
      ).innerText.split("\n")
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
