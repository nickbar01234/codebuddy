import monaco from "monaco-editor";
import { GenericMessage } from "./utils";

interface LeetCodeOnCodeChangeMessage extends GenericMessage {
  action: "leetCodeOnCodeChange";
  changes: monaco.editor.IModelContentChange;
}

interface LeetCodeOnLanguageChangeMessage extends GenericMessage {
  action: "leetCodeOnLanguageChange";
  language: string;
}

interface NavigateMessage extends GenericMessage {
  action: "navigate";
  url: string;
}

export type WindowMessage =
  | LeetCodeOnCodeChangeMessage
  | NavigateMessage
  | LeetCodeOnLanguageChangeMessage;
