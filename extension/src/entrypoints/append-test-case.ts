import { ExtractMessage, MessagePayload, WindowMessage } from "@cb/types";
import {
  waitForElementAtIndex,
  waitForElementsWithCondition,
} from "@cb/utils/dom";
import { assertUnreachable } from "@cb/utils/error";
import { defineUnlistedScript } from "wxt/utils/define-unlisted-script";

const appendTestCaseToLeetCode = async (
  args: MessagePayload<
    ExtractMessage<WindowMessage, "appendTestCaseToLeetCode">
  >
) => {
  const { testValues } = args;

  try {
    const testCaseButtons = document.querySelectorAll(
      'button[data-e2e-locator="console-testcase-tag"]'
    );

    const addButton = testCaseButtons[
      testCaseButtons.length - 1
    ].parentElement?.querySelector('button[data-state="closed"]') as
      | HTMLButtonElement
      | undefined;

    if (!addButton) {
      console.error("Add test case button not found");
      return;
    }
    addButton.click();

    const newButton = (await waitForElementAtIndex(
      'button[data-e2e-locator="console-testcase-tag"]',
      testCaseButtons.length
    )) as HTMLButtonElement;

    newButton.click();

    const inputs = await waitForElementsWithCondition(
      'div[data-e2e-locator="console-testcase-input"][contenteditable="true"]',
      (elements) => elements.length === testValues.length,
      document
    );

    for (let index = 0; index < inputs.length; index++) {
      const input = inputs[index];
      const inputDiv = input as HTMLDivElement;
      const value = testValues[index];

      inputDiv.focus();
      inputDiv.textContent = value;
      inputDiv.dispatchEvent(new Event("input", { bubbles: true }));
      inputDiv.blur();
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  } catch (error) {
    console.error("Failed to append test case:", error);
  }
};
export default defineUnlistedScript(() => {
  window.addEventListener(
    "message",
    async (message: MessageEvent<WindowMessage>) => {
      if (message.data.action == undefined) {
        return;
      }
      const action = message.data.action;
      switch (action) {
        case "appendTestCaseToLeetCode": {
          const { action: _, ...args } = message.data;
          await appendTestCaseToLeetCode(args);
          break;
        }

        case "leetCodeOnChange":
        case "navigate":
        case "setCodeBuddyCode":
          break;

        default:
          assertUnreachable(action);
      }
    }
  );
});
