import { URLS } from "@cb/constants";
import {
  ContentRequest,
  ExtractMessage,
  ResponseStatus,
  ServiceRequest,
  ServiceResponse,
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

  const setValueModel = async (
    args: Pick<
      ExtractMessage<ServiceRequest, "setValueOtherEditor">,
      "code" | "language" | "changes" | "changeUser" | "editorId"
    >
  ) => {
    const { code, language, changes, changeUser } = args;
    const editor = window.monaco?.editor
      .getEditors()
      .find((editor) => editor.getContainerDomNode().id === "CodeBuddyEditor");
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
        case "getUserCode": {
          browser.scripting
            .executeScript({
              target: { tabId: sender.tab?.id ?? 0 },
              files: ["/get-user-code.js"],
              world: "MAIN",
            })
            .then((result) => {
              sendResponse(result[0].result);
            });

          break;
        }

        case "setupEditors": {
          browser.scripting
            .executeScript({
              target: { tabId: sender.tab?.id ?? 0 },
              files: ["/setup-editors.js"],
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
              files: ["/get-language-extension.js"],
              world: "MAIN",
            })
            .then((response) =>
              sendResponse(
                servicePayload<"getLanguageExtension">(
                  (response[0].result as any) ?? []
                )
              )
            );
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
