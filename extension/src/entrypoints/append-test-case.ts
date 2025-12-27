// extension/src/entrypoints/append-test-case.ts
import { ExtractMessage, MessagePayload, WindowMessage } from "@cb/types";
import {
  waitForElementAtIndex,
  waitForElementsWithCondition,
} from "@cb/utils/dom";

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

    if (testCaseButtons.length === 0) {
      throw new Error("No test case buttons found");
    }

    const lastTestCaseButton = testCaseButtons[
      testCaseButtons.length - 1
    ] as HTMLElement;
    const container = lastTestCaseButton.closest("div")?.parentElement;

    let addButton: HTMLButtonElement | undefined;

    if (container) {
      const closedButtons = container.querySelectorAll(
        'button[data-state="closed"]'
      );
      addButton = Array.from(closedButtons)[0] as HTMLButtonElement | undefined;
    }

    if (!addButton) {
      throw new Error("Add test case button not found");
    }

    const initialCount = testCaseButtons.length;
    const expectedNewIndex = initialCount;
    addButton.click();

    const newButton = (await waitForElementAtIndex(
      'button[data-e2e-locator="console-testcase-tag"]',
      expectedNewIndex
    )) as HTMLButtonElement;

    newButton.click();

    const newButtonContainer = newButton.closest("div")?.parentElement;
    let activeTestCasePanel: Element | null = null;

    if (newButtonContainer) {
      activeTestCasePanel =
        newButtonContainer.querySelector(
          '[data-e2e-locator="console-testcase-panel"]:not([hidden])'
        ) ||
        newButtonContainer.querySelector(
          '.testcase-panel:not([hidden]), [class*="testcase"][class*="active"]'
        );
    }
    await new Promise((resolve) => setTimeout(resolve, 100));

    const inputs = await waitForElementsWithCondition(
      'div[data-e2e-locator="console-testcase-input"][contenteditable="true"]',
      (elements) => elements.length === testValues.length,
      activeTestCasePanel || document
    );
    let finalInputs: Element[];
    if (activeTestCasePanel) {
      finalInputs = Array.from(inputs).filter((input) =>
        activeTestCasePanel!.contains(input)
      );
    } else {
      finalInputs = Array.from(inputs);
    }

    const visibleInputs = Array.from(inputs).filter((input) => {
      const element = input as HTMLElement;
      const style = window.getComputedStyle(element);
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        element.offsetParent !== null
      );
    });

    const finalFilteredInputs =
      visibleInputs.length === testValues.length ? visibleInputs : finalInputs;

    if (finalFilteredInputs.length !== testValues.length) {
      throw new Error(
        `Expected ${testValues.length} inputs, found ${finalFilteredInputs.length} visible inputs`
      );
    }

    finalFilteredInputs.forEach((input) => {
      const inputDiv = input as HTMLDivElement;

      inputDiv.focus();

      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(inputDiv);
        selection.removeAllRanges();
        selection.addRange(range);
      }

      inputDiv.textContent = "";
      inputDiv.innerText = "";

      const deleteEvent = new KeyboardEvent("keydown", {
        bubbles: true,
        cancelable: true,
        key: "Backspace",
        code: "Backspace",
      });
      inputDiv.dispatchEvent(deleteEvent);

      inputDiv.dispatchEvent(new Event("input", { bubbles: true }));
      inputDiv.dispatchEvent(new Event("change", { bubbles: true }));
      inputDiv.blur();
    });

    for (let index = 0; index < finalInputs.length; index++) {
      const input = finalInputs[index];
      const inputDiv = input as HTMLDivElement;
      const value = testValues[index];

      inputDiv.focus();

      inputDiv.textContent = value;
      inputDiv.innerText = value;

      const inputEvent = new InputEvent("input", {
        bubbles: true,
        cancelable: true,
        inputType: "insertText",
        data: value,
      });
      inputDiv.dispatchEvent(inputEvent);

      inputDiv.dispatchEvent(
        new Event("input", { bubbles: true, cancelable: true })
      );
      inputDiv.dispatchEvent(
        new Event("change", { bubbles: true, cancelable: true })
      );

      inputDiv.blur();

      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  } catch (error: any) {
    console.error("Failed to append test case:", error);
  }
};

export default defineUnlistedScript(() => {
  console.log("Inject append test case handler");
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
