import monaco from "monaco-editor";
import { GenericMessage } from "./utils";

interface LeetCodeOnChangeMessage extends GenericMessage {
  action: "leetCodeOnChange";
  changes: monaco.editor.IModelContentChange;
}

interface NavigateMessage extends GenericMessage {
  action: "navigate";
  url: string;
}

export type WindowMessage = LeetCodeOnChangeMessage | NavigateMessage;
