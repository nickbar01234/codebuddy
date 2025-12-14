import { URLS } from "@cb/constants";
import {
  ContentRequest,
  ExtractMessage,
  ResponseStatus,
  ServiceRequest,
  ServiceResponse,
  WindowMessage,
} from "@cb/types";

export default defineBackground(() => {
  const injectContentScriptIntoLeetCodeTabs = async () => {
    const tabs = await browser.tabs.query({ url: URLS.ALL_PROBLEMS });
    console.log(`Found ${tabs.length} LeetCode tabs for injection`);

    for (const tab of tabs) {
      if (tab.id) {
        try {
          await browser.scripting.insertCSS({
            target: { tabId: tab.id },
            files: ["content-scripts/content.css"],
          });
          await browser.scripting.executeScript({
            target: { tabId: tab.id },
            files: ["content-scripts/content.js"],
          });
        } catch (error) {
          console.log(`Failed to inject into tab ${tab.id}:`, error);
        }
      }
    }
  };

  browser.runtime.onInstalled.addListener(async (details) => {
    console.log(`Extension ${details.reason}:`, details);

    if (details.reason === "install" || details.reason === "update") {
      await injectContentScriptIntoLeetCodeTabs();
    }
  });

  browser.management.onEnabled.addListener(async (info) => {
    if (info.id === browser.runtime.id) {
      await injectContentScriptIntoLeetCodeTabs();
    }
  });

  const servicePayload = <T extends ServiceRequest["action"]>(
    payload: ServiceResponse[T]
  ) => payload;

  const contentPayload = <T extends ContentRequest>(payload: T) => payload;

  const getValue = async () => {
    const model = window.monaco?.editor
      .getEditors()
      .filter((editor: any) => editor.id !== "CodeBuddy")
      .map((editor) => editor.getModel())
      .find((model) => model?.getLanguageId() !== "plaintext");
    return {
      value: model?.getValue() ?? "",
      language: model?.getLanguageId() ?? "",
    };
  };

  const setupCodeBuddyModel = async (id: string) => {
    if (window.monaco == undefined) {
      return {
        status: 1,
      };
    }

    const hasNotSetup =
      window.monaco.editor
        .getEditors()
        .find((editor: any) => editor.id === "CodeBuddy") == undefined;
    const editorDom = document.getElementById(id);
    if (hasNotSetup && editorDom != null) {
      const editor = window.monaco.editor.create(editorDom, {
        readOnly: true,
        scrollBeyondLastLine: false,
        automaticLayout: true,
        minimap: { enabled: false },
        padding: {
          top: 8,
        },
      });
      editor.updateOptions({
        padding: {
          bottom:
            editor.getOption(window.monaco.editor.EditorOption.lineHeight) * 8,
        },
      });
      (editor as any).id = "CodeBuddy";
      return {
        status: 0,
      };
    }

    return {
      status: 1,
    };
  };

  const setupLeetCodeModel = async () => {
    const model = window.monaco?.editor
      .getEditors()
      .filter((editor: any) => editor.id !== "CodeBuddy")
      .map((editor) => editor.getModel())
      .find((model) => model?.getLanguageId() !== "plaintext");

    if (model == undefined) {
      return {
        status: 1,
      };
    }

    model.onDidChangeContent((event) => {
      const onChange: WindowMessage = {
        action: "leetCodeOnChange",
        changes: event.changes[0],
      };
      window.postMessage(onChange);
    });

    return {
      status: 0,
    };
  };

  const setValueModel = async (
    args: Pick<
      ExtractMessage<ServiceRequest, "setValueOtherEditor">,
      "code" | "language" | "changes" | "changeUser" | "editorId"
    >
  ) => {
    const { code, language, changes, changeUser } = args;
    const editor = window.monaco?.editor
      .getEditors()
      .find((editor: any) => editor.id === "CodeBuddy");
    const model = editor?.getModel();

    if (
      editor == undefined ||
      model == undefined ||
      window.monaco == undefined
    ) {
      return;
    }

    if (
      model.getLanguageId() != language ||
      changeUser ||
      Object.keys(changes).length === 0
    ) {
      window.monaco.editor.setModelLanguage(model, language);
      editor.setValue(code);
      return;
    }

    const editOperations = {
      identifier: { major: 1, minor: 1 },
      range: new window.monaco.Range(
        changes.range.startLineNumber,
        changes.range.startColumn,
        changes.range.endLineNumber,
        changes.range.endColumn
      ),
      text: changes.text,
      forceMoveMarkers: false,
    };
    editor.updateOptions({ readOnly: false });
    editor.executeEdits("apply changes", [editOperations]);
    if (editor.getValue() !== code) {
      editor.setValue(code);
    }
    editor.updateOptions({ readOnly: true });
  };

  const getLanguageExtension = () => {
    const monaco = (window as any).monaco;
    const getLanguages = monaco?.languages?.getLanguages;
    if (getLanguages == undefined) {
      return [];
    }
    return getLanguages() as any[];
  };

  const addAndFillTestCase = async (testValues: string[]) => {
    const SUCCESS = 0;
    const FAIL = 1;

    try {
      const addButton = Array.from(
        document.querySelectorAll('button[data-state="closed"]')
      ).find((button) => {
        const svg = button.querySelector('svg[viewBox="0 0 24 24"]');
        if (!svg) return false;
        const path = svg.querySelector('path[d*="M13 11h7"]');
        return path !== null;
      }) as HTMLButtonElement | undefined;

      if (!addButton) {
        throw new Error("Add test case button not found");
      }

      addButton.click();

      await new Promise((resolve) => setTimeout(resolve, 300));

      const testCaseButtons = document.querySelectorAll(
        'button[data-e2e-locator="console-testcase-tag"]'
      );
      if (testCaseButtons.length === 0) {
        throw new Error("No test case buttons found");
      }

      const lastButton = testCaseButtons[
        testCaseButtons.length - 1
      ] as HTMLButtonElement;
      lastButton.click();

      await new Promise((resolve) => setTimeout(resolve, 200));

      const inputs = document.querySelectorAll(
        'div[data-e2e-locator="console-testcase-input"][contenteditable="true"]'
      );

      if (inputs.length !== testValues.length) {
        throw new Error(
          `Expected ${testValues.length} inputs, found ${inputs.length}`
        );
      }

      inputs.forEach((input, index) => {
        const inputDiv = input as HTMLDivElement;
        inputDiv.textContent = testValues[index];

        inputDiv.dispatchEvent(new Event("input", { bubbles: true }));
        inputDiv.dispatchEvent(new Event("change", { bubbles: true }));
        inputDiv.dispatchEvent(new Event("blur", { bubbles: true }));
      });

      return { status: SUCCESS };
    } catch (error: any) {
      console.error("Failed to add test case:", error);
      return {
        status: FAIL,
        message: error?.message ?? "Unknown error",
      };
    }
  };

  browser.action.onClicked.addListener(() => {
    browser.tabs.query({ url: URLS.ALL_PROBLEMS }).then((tabs) =>
      tabs.forEach((tab) => {
        if (tab.id != undefined) {
          browser.tabs.sendMessage(
            tab.id,
            contentPayload({ action: "toggleUi" })
          );
        }
      })
    );
  });

  browser.tabs.onUpdated.addListener((tab, change) => {
    if (change.url) {
      browser.tabs.sendMessage(
        tab,
        contentPayload({ action: "url", url: change.url })
      );
    }
  });

  browser.runtime.onMessage.addListener(
    (request: ServiceRequest, sender, sendResponse) => {
      const { action } = request;
      switch (action) {
        case "getValue": {
          browser.scripting
            .executeScript({
              target: { tabId: sender.tab?.id ?? 0 },
              func: getValue,
              world: "MAIN",
            })
            .then((result) => {
              sendResponse(result[0].result);
            });

          break;
        }

        case "setupCodeBuddyModel": {
          browser.scripting
            .executeScript({
              target: { tabId: sender.tab?.id ?? 0 },
              func: setupCodeBuddyModel,
              args: [request.id],
              world: "MAIN",
            })
            .then((result) => {
              sendResponse(result[0].result);
            });
          break;
        }

        case "setupLeetCodeModel": {
          browser.scripting
            .executeScript({
              target: { tabId: sender.tab?.id ?? 0 },
              func: setupLeetCodeModel,
              args: [],
              world: "MAIN",
            })
            .then((result) => sendResponse(result[0].result));
          break;
        }

        case "setValueOtherEditor": {
          browser.scripting
            .executeScript({
              target: { tabId: sender.tab?.id ?? 0 },
              func: setValueModel,
              args: [
                {
                  code: request.code,
                  language: request.language,
                  changes: request.changes,
                  changeUser: request.changeUser,
                  editorId: request.editorId,
                },
              ],
              world: "MAIN",
            })
            .then(() => sendResponse());
          break;
        }

        case "getActiveTabId": {
          // Per https://developer.browser.com/docs/extensions/develop/concepts/content-scripts, we don't have access to
          // browser API. So using background as a proxy
          sendResponse(sender.tab?.id ?? -1);
          break;
        }

        case "closeSignInTab": {
          const {
            signIn: { url, tabId },
          } = request;
          browser.tabs
            .get(tabId)
            .then(async (tab) => {
              const response = servicePayload<"closeSignInTab">({
                status: tab.url?.startsWith(url)
                  ? ResponseStatus.SUCCESS
                  : ResponseStatus.FAIL,
              });
              if (response.status === ResponseStatus.SUCCESS) {
                await browser.tabs.remove(tabId);
              }
              sendResponse(response);
            })
            .catch(console.error);
          break;
        }

        case "getLanguageExtension": {
          browser.scripting
            .executeScript({
              target: { tabId: sender.tab?.id ?? 0 },
              func: getLanguageExtension,
              args: [],
              world: "MAIN",
            })
            .then((response) =>
              sendResponse(
                servicePayload<"getLanguageExtension">(response[0].result ?? [])
              )
            );
          break;
        }

        case "appendTestCaseToLeetCode": {
          browser.scripting
            .executeScript({
              target: { tabId: sender.tab?.id ?? 0 },
              func: addAndFillTestCase,
              args: [request.testValues],
              world: "MAIN",
            })
            .then((results) => {
              console.log("appendTestCaseToLeetCode results:", results);
              const result = results?.[0]?.result;
              console.log("appendTestCaseToLeetCode result:", result);
              if (result && typeof result === "object" && "status" in result) {
                const response =
                  servicePayload<"appendTestCaseToLeetCode">(result);
                console.log("Sending response:", response);
                sendResponse(response);
              } else {
                const response = servicePayload<"appendTestCaseToLeetCode">({
                  status: ResponseStatus.FAIL,
                  message: "No result returned",
                });
                console.log("Sending error response:", response);
                sendResponse(response);
              }
            })
            .catch((error) => {
              console.error("Failed to append test case:", error);
              const response = servicePayload<"appendTestCaseToLeetCode">({
                status: ResponseStatus.FAIL,
                message: error?.message ?? "Unknown error",
              });
              console.log("Sending catch error response:", response);
              sendResponse(response);
            });
          break;
        }

        default:
          console.error(`Unhandled request ${request}`);
          assertUnreachable(action);
      }

      return true;
    }
  );
});
