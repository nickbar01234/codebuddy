import monaco from "monaco-editor";
import { GenericMessage } from "./utils";

interface LeetCodeOnChangeMessage extends GenericMessage {
  action: "leetCodeOnChange";
  changes: monaco.editor.IModelContentChange;
}

export type WindowMessage = LeetCodeOnChangeMessage;
