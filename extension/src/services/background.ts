/* eslint-disable @typescript-eslint/no-explicit-any */
import { setStorage } from "@cb/services";
import { ServiceRequest, Status, SetOtherEditorRequest } from "@cb/types";
import { updateEditorLayout } from "@cb/services/handlers/editor";

const handleCookieRequest = async (): Promise<Status> => {
  const maybeCookie = await chrome.cookies.get({
    name: "LEETCODE_SESSION",
    url: "https://leetcode.com/",
  });

  if (maybeCookie == null) {
    return { status: "UNAUTHENTICATED" };
  }

  const sessionBase64 = maybeCookie.value.split(".")[1]; // Leetcode uses . to separate base64
  const session = JSON.parse(atob(sessionBase64));
  return {
    status: "AUTHENTICATED",
    user: { id: session.identity, username: session.username },
  };
};

/**
 * Initialize default settings
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    setStorage({
      editorPreference: {
        width: 300 /* px */,
        isCollapsed: false,
      },
    });
  }
});

/**
 * TODO(nickbar01234) - Redesign authentication flow
 *
 * @docs https://stackoverflow.com/a/61056192
 */

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

const setValue = async (value: string) => {
  const monaco = (window as any).monaco;
  const lcCodeEditor = monaco.editor
    .getEditors()
    .filter((e: any) => e.id !== "CodeBuddy")
    .map((e: any) => e.getModel())
    .find((m: any) => m.getLanguageId() !== "plaintext");
  lcCodeEditor.setValue(value);
};

const createModel = async (id: string, code: string, language: string) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monaco = (window as any).monaco;
  if (monaco.editor.getModels().length === 3) {
    // console.log("Using Existing Model");
    setValueModel({
      code,
      language,
      changes: {
        range: {
          startLineNumber: 1,
          startColumn: 1,
          endLineNumber: 1,
          endColumn: 1,
        },
        rangeLength: 0,
        text: code,
        rangeOffset: 0,
        forceMoveMarkers: false,
      },
      changeUser: true,
    });
  } else {
    // console.log("Creating New Model");
    const buddyEditor = await monaco.editor.create(
      document.getElementById(id),
      {
        value: code,
        language: language,
        readOnly: true,
      }
    );
    buddyEditor.id = "CodeBuddy";
  }
};

const setValueModel = async (
  args: Pick<
    SetOtherEditorRequest,
    "code" | "language" | "changes" | "changeUser"
  >
) => {
  const { code, language, changes, changeUser } = args;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monaco = (window as any).monaco;
  const myEditor = await monaco.editor
    .getEditors()
    .find((e: any) => e.id === "CodeBuddy");
  const myLanguage = await myEditor.getModel().getLanguageId();
  if (myLanguage !== language || changeUser) {
    // console.log("Setting Value Model");
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
  await myEditor.updateOptions({ readOnly: true });
  // console.log("Applied Changes");
};

const cleanEditor = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monaco = (window as any).monaco;
  // console.log("Cleaned Editor");
  try {
    await monaco.editor
      .getEditors()
      .find((e: any) => e.id === "CodeBuddy")
      .dispose();
  } catch (e) {
    // console.error(e);
  }
  // console.log("Cleaned Editor");
};

chrome.webNavigation.onCompleted.addListener(
  function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      setTimeout(() => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id ?? 0 },
          func: () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const monaco = (window as any).monaco;
            const lcCodeEditor = monaco.editor
              .getEditors()
              .filter((e: any) => e.id !== "CodeBuddy")
              .map((e: any) => e.getModel())
              .find((m: any) => m.getLanguageId() !== "plaintext");
            lcCodeEditor.onDidChangeContent((event: any) => {
              const trackEditor = document.getElementById("trackEditor");
              if (trackEditor != null) {
                trackEditor.textContent = JSON.stringify(event.changes[0]);
              }
            });
          },
          world: "MAIN",
        });
      }, 2000);
    });
  },
  { url: [{ schemes: ["http", "https"] }] }
);

const a: {
  [key: number]: string;
} = {};

let i = 0;

chrome.runtime.onMessage.addListener(
  (request: ServiceRequest, sender, sendResponse) => {
    switch (request.action) {
      case "cookie": {
        handleCookieRequest().then((res) => {
          sendResponse(res);
        });
        break;
      }
      case "getValue": {
        chrome.scripting
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
      case "setValue": {
        chrome.scripting
          .executeScript({
            target: { tabId: sender.tab?.id ?? 0 },
            func: setValue,
            args: [request.value],
            world: "MAIN",
          })
          .then(() => {
            sendResponse();
          });
        break;
      }
      case "createModel": {
        chrome.scripting
          .executeScript({
            target: { tabId: sender.tab?.id ?? 0 },
            func: createModel,
            args: [request.id, request.code, request.language],
            world: "MAIN",
          })
          .then(() => {
            sendResponse();
          });
        break;
      }
      case "setValueOtherEditor": {
        chrome.scripting
          .executeScript({
            target: { tabId: sender.tab?.id ?? 0 },
            func: setValueModel,
            args: [
              {
                code: request.code,
                language: request.language,
                changes: request.changes,
                changeUser: request.changeUser,
              },
            ],
            world: "MAIN",
          })
          .then(() => {
            sendResponse();
          });
        break;
      }

      case "updateEditorLayout": {
        chrome.scripting.executeScript({
          target: { tabId: sender.tab?.id ?? 0 },
          func: updateEditorLayout,
          args: [{ id: request.monacoEditorId }],
          world: "MAIN",
        });
        break;
      }

      case "cleanEditor": {
        chrome.scripting.executeScript({
          target: { tabId: sender.tab?.id ?? 0 },
          func: cleanEditor,
          world: "MAIN",
        });
        break;
      }

      case "test": {
        // console.log("TestRequest");
        a[i++] = "a";
        sendResponse({ a });
        break;
      }

      default:
        // console.error(`Unhandled request ${request}`);
        break;
    }

    return true;
  }
);
