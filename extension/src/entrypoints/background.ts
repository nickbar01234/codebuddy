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
    const model = window.monaco?.editor
      .getEditors()
      .filter((editor: any) => editor.id !== "CodeBuddy")
      .map((editor) => editor.getModel())
      .find((model) => model?.getLanguageId() !== "plaintext");
    return {
      value: model?.getValue(),
      language: model?.getLanguageId(),
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
        action: "leetCodeOnCodeChange",
        changes: event.changes[0],
      };
      window.postMessage(onChange);
    });

    model.onDidChangeLanguage((event) => {
      const onChange: WindowMessage = {
        action: "leetCodeOnLanguageChange",
        language: event.newLanguage,
      };
      window.postMessage(onChange);
    });

    return {
      status: 0,
      data: {
        language: model.getLanguageId(),
      },
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
      changes === undefined
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
                data: undefined,
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
          assertUnreachable(action);
      }

      return true;
    }
  );
});
