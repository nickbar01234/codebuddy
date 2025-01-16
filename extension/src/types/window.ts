import { LeetCodeContentChange } from "./utils";

interface LeetCodeOnChangeMessage {
  action: "leetCodeOnChange";
  changes: LeetCodeContentChange;
}

export type WindowMessage = LeetCodeOnChangeMessage;
