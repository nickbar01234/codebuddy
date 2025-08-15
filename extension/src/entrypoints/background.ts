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
  const servicePayload = <T extends ServiceRequest["action"]>(
    payload: ServiceResponse[T]
  ) => payload;

  const contentPayload = <T extends ContentRequest>(payload: T) => payload;

  const getValue = async () => {
    const monaco = (window as any).monaco;

    const lcCodeEditor = monaco.editor
      .getEditors()
      .filter((e: any) => e.id !== "CodeBuddy")
      .map((e: any) => e.getModel())
      .find((m: any) => m.getLanguageId() !== "plaintext");

    return {
      value: lcCodeEditor.getValue(),
      language: lcCodeEditor.getLanguageId(),
    };
  };

  const pasteCode = async (value: string) => {
    const monaco = (window as any).monaco;
    const myEditor = monaco.editor
      .getEditors()
      .filter((e: any) => e.id !== "CodeBuddy")
      .find((m: any) => m.getModel().getLanguageId() !== "plaintext");
    try {
      const fullRange = myEditor.getModel().getFullModelRange();
      myEditor.executeEdits(null, [
        {
          range: fullRange,
          text: value,
        },
      ]);
      myEditor.pushUndoStop();
    } catch (e) {
      console.error(e);
    }
  };

  const setupCodeBuddyModel = async (id: string) => {
    const windowAsAny = window as any;
    if (windowAsAny.monaco == undefined) {
      return {
        status: 1,
      };
    } else {
      const monaco = windowAsAny.monaco;
      console.log("Setting up CodeBuddy model");
      if (
        monaco.editor
          .getEditors()
          .find((editor: any) => editor.id === "CodeBuddy") == undefined
      ) {
        // console.log("No Editor Found");
        const buddyEditor = await monaco.editor.create(
          document.getElementById(id),
          {
            readOnly: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            minimap: { enabled: false },
            padding: {
              top: 8,
            },
          }
        );
        buddyEditor.id = "CodeBuddy";
      }
      console.log("Finished setting up CodeBuddy model");
      return {
        status: 0,
      };
    }
  };

  const setupLeetCodeModel = async () => {
    const windowAsAny = window as any;
    if (windowAsAny.monaco == undefined) {
      return {
        status: 1,
      };
    } else {
      console.log("Setting up LeetCode model");
      const leetCodeEditor = windowAsAny.monaco.editor
        .getEditors()
        .filter((e: any) => e.id !== "CodeBuddy")
        .map((e: any) => e.getModel())
        .find((m: any) => m.getLanguageId() !== "plaintext");
      if (!leetCodeEditor) {
        console.error("LeetCode editor model not found");
        return { status: ResponseStatus.FAIL };
      }
      leetCodeEditor.onDidChangeContent((event: any) => {
        // todo(nickbar01234): Don't have a good way to include function from a different file yet
        // Ideally, we should do the same pattern as services/index.ts
        const leetCodeOnChange: WindowMessage = {
          action: "leetCodeOnChange",
          changes: event.changes[0],
        };
        window.postMessage(leetCodeOnChange);
      });
      console.log("Finished setting up LeetCode model");
      return {
        status: 0,
      };
    }
  };

  const setValueModel = async (
    args: Pick<
      ExtractMessage<ServiceRequest, "setValueOtherEditor">,
      "code" | "language" | "changes" | "changeUser" | "editorId"
    >
  ) => {
    // console.log("using setValueModel");
    const { code, language, changes, changeUser } = args;

    const monaco = (window as any).monaco;
    const myEditor = await monaco.editor
      .getEditors()
      .find((e: any) => e.id === "CodeBuddy");
    const myLanguage = await myEditor.getModel().getLanguageId();

    if (
      myLanguage !== language ||
      changeUser ||
      Object.keys(changes).length === 0
    ) {
      console.log("Setting Value Model");
      await monaco.editor.setModelLanguage(myEditor.getModel(), language);
      myEditor.setValue(code);
      return;
    }

    const editOperations = {
      identifier: { major: 1, minor: 1 },
      range: new monaco.Range(
        changes.range.startLineNumber,
        changes.range.startColumn,
        changes.range.endLineNumber,
        changes.range.endColumn
      ),
      text: changes.text,
      forceMoveMarkers: false,
    };
    await myEditor.updateOptions({ readOnly: false });
    await myEditor.executeEdits("apply changes", [editOperations]);
    const myCode = await myEditor.getValue();
    if (myCode !== code) {
      await myEditor.setValue(code);
    }
    await myEditor.updateOptions({ readOnly: true });
  };

  const getLanguageExtension = () => {
    const monaco = (window as any).monaco;
    const getLanguages = monaco?.languages?.getLanguages;
    if (getLanguages == undefined) {
      return [];
    }
    return getLanguages() as any[];
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

  browser.runtime.onMessage.addListener(
    (request: ServiceRequest, sender, sendResponse) => {
      switch (request.action) {
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

        case "pasteCode": {
          browser.scripting
            .executeScript({
              target: { tabId: sender.tab?.id ?? 0 },
              func: pasteCode,
              args: [request.value],
              world: "MAIN",
            })
            .then(sendResponse);
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
            .then(() => {
              sendResponse();
            });
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

        default:
          console.error(`Unhandled request ${request}`);
          break;
      }

      return true;
    }
  );
});
