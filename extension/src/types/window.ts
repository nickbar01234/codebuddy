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

interface SetCodeBuddyCodeMessage extends GenericMessage {
  action: "setCodeBuddyCode";
  code: string;
  language: string;
  changes: monaco.editor.IModelContentChange;
  changeUser: boolean;
}

interface AppendTestCaseToLeetCodeMessage extends GenericMessage {
  action: "appendTestCaseToLeetCode";
  testValues: string[];
}

export type WindowMessage =
  | LeetCodeOnChangeMessage
  | NavigateMessage
  | SetCodeBuddyCodeMessage
  | AppendTestCaseToLeetCodeMessage;
