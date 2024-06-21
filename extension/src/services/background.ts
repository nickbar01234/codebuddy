import { setStorage } from "@cb/services";
import { ServiceRequest, Status } from "@cb/types";

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
  const editors = monaco.editor.getEditors();
  const editorsWithIndex = editors.map((e: any, index: number) => {
    return {
      id: e.id,
      index: index,
    };
  });
  const lcEditors = editorsWithIndex.filter((e: any) => e.id !== "CodeBuddy");
  const lcEditorIndexes = lcEditors.map((e: any) => e.index);
  const lcCodeEditor = monaco.editor
    .getModels()
    .filter((m: any, index: number) => lcEditorIndexes.includes(index))
    .find((e: any) => e.getLanguageId() !== "plaintext");

  return {
    value: lcCodeEditor.getValue(),
    language: lcCodeEditor.getLanguageId(),
  };
};

const setValue = async (value: string) => {
  const monaco = (window as any).monaco;
  const editors = monaco.editor.getEditors();
  const editorsWithIndex = editors.map((e: any, index: number) => {
    return {
      id: e.id,
      index: index,
    };
  });
  const lcEditors = editorsWithIndex.filter((e: any) => e.id !== "CodeBuddy");
  const lcEditorIndexes = lcEditors.map((e: any) => e.index);
  const lcCodeEditor = monaco.editor
    .getModels()
    .filter((m: any, index: number) => lcEditorIndexes.includes(index))
    .find((e: any) => e.getLanguageId() !== "plaintext");
  lcCodeEditor.setValue(value);
};

const createModel = async (id: string, code: string, language: string) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monaco = (window as any).monaco;
  if (monaco.editor.getModels().length === 3) {
    return;
  }
  const buddyEditor = await monaco.editor.create(document.getElementById(id), {
    value: code,
    language: language,
    readOnly: true,
  });
  buddyEditor.id = "CodeBuddy";
};

const setValueModel = async (code: string, language: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monaco = (window as any).monaco;
  const myEditor = await monaco.editor.getModels()[2];
  myEditor.setValue(code);
  const myLanguage = await myEditor.getLanguageId();
  if (myLanguage !== language) {
    await monaco.editor.setModelLanguage(myEditor, language);
  }
};

console.dir(chrome.webNavigation);
chrome.runtime.onMessage.addListener(
  (request: ServiceRequest, _sender, sendResponse) => {
    setTimeout(() => {
      chrome.scripting.executeScript({
        target: { tabId: _sender.tab?.id ?? 0 },
        func: () => {
          const monaco = (window as any).monaco;
          const editors = monaco.editor.getEditors();
          const editorsWithIndex = editors.map((e: any, index: number) => {
            return {
              id: e.id,
              index: index,
            };
          });
          const lcEditors = editorsWithIndex.filter(
            (e: any) => e.id !== "CodeBuddy"
          );
          const lcEditorIndexes = lcEditors.map((e: any) => e.index);
          const lcCodeEditor = monaco.editor
            .getModels()
            .filter((m: any, index: number) => lcEditorIndexes.includes(index))
            .find((e: any) => e.getLanguageId() !== "plaintext");
          lcCodeEditor.onDidChangeContent((event: any) => {
            console.dir(event);
          });
        },
        world: "MAIN",
      });
    }, 1000);

    console.debug("Receiving", request);
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
            target: { tabId: _sender.tab?.id ?? 0 },
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
            target: { tabId: _sender.tab?.id ?? 0 },
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
            target: { tabId: _sender.tab?.id ?? 0 },
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
            target: { tabId: _sender.tab?.id ?? 0 },
            func: setValueModel,
            args: [request.code, request.language],
            world: "MAIN",
          })
          .then(() => {
            sendResponse();
          });
        break;
      }

      default:
        console.error(`Unhandled request ${request}`);
        break;
    }

    return true;
  }
);
