import { GenericMessage, LeetCodeContentChange } from "./utils";

interface LeetCodeOnChangeMessage extends GenericMessage {
  action: "leetCodeOnChange";
  changes: LeetCodeContentChange;
}

export type WindowMessage = LeetCodeOnChangeMessage;
