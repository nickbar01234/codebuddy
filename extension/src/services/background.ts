import { setStorage } from "@cb/services";
import { ServiceRequest, Status , SetOtherEditorRequest} from "@cb/types";

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
    setStorage({ editorPreference: { width: 300 /* px */ } });
  }
});

/**
 * TODO(nickbar01234) - Redesign authentication flow
 *
 * @docs https://stackoverflow.com/a/61056192
 */

const getValue = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monaco = (window as any).monaco;
  const userEditor = monaco.editor.getModels()[0];
  const language = userEditor.getLanguageId();
  return {
    value: userEditor.getValue(),
    language,
  };

}

const setValue = async (value: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userEditor = (window as any).monaco.editor.getModels()[0];
  userEditor.setValue(value);
}

const createModel = async (id: string, code: string, language: string) => {
  await new Promise((resolve) => setTimeout(resolve, 2000));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monaco = (window as any).monaco;
  if (monaco.editor.getModels().length === 3) {
    setValueModel({code, language, changes:{
      range: {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: 1,
        endColumn: 1
      },
      rangeLength: 0,
      text: code,
      rangeOffset: 0,
      forceMoveMarkers: false
    }});
  }
  else {
    await monaco.editor.create(document.getElementById(id), {
      value: code,
      language: language,
      readOnly: true,
    });
  }
}

const setValueModel = async (args: Pick<SetOtherEditorRequest, "code" | "language" | "changes">) => {
  const { code, language, changes } = args;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const monaco = (window as any).monaco;
  const myEditor = await monaco.editor.getEditors()[2];
  const myLanguage = await myEditor.getModel().getLanguageId();
  if (myLanguage !== language) {
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
    forceMoveMarkers: false
  }
  await myEditor.updateOptions({ readOnly: false });
  await myEditor.executeEdits("apply changes", [editOperations]);
  await myEditor.updateOptions({ readOnly: true });
}

chrome.webNavigation.onCompleted.addListener(
  function () {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      setTimeout(() => {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id ?? 0 },
          func: () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any).monaco.editor.getModels()[0].onDidChangeContent(async (event: any) => {
              const trackEditor = document.getElementById("trackEditor")
              if (trackEditor != null) {
                trackEditor.textContent = JSON.stringify(event.changes[0]);
              }
            })
          },
          world: "MAIN",
        })
      }, 1000);
    });
  },
  { url: [{ schemes: ["http", "https"] }] }
);

chrome.runtime.onMessage.addListener(
  (request: ServiceRequest, _sender, sendResponse) => {
    switch (request.action) {
      case "cookie": {
        handleCookieRequest().then((res) => {
          sendResponse(res);
        });
        break;
      }
      case "getValue": {
        chrome.scripting.executeScript({
          target: { tabId: _sender.tab?.id ?? 0 },
          func: getValue,
          world: "MAIN",
        }).then((result) => {
          sendResponse(result[0].result);
        })
        break;
      }
      case "setValue": {
        chrome.scripting.executeScript({
          target: { tabId: _sender.tab?.id ?? 0 },
          func: setValue,
          args: [request.value],
          world: "MAIN",
        }).then(() => {
          sendResponse();
        })
        break;
      }
      case "createModel": {
        chrome.scripting.executeScript({
          target: { tabId: _sender.tab?.id ?? 0 },
          func: createModel,
          args: [request.id, request.code, request.language],
          world: "MAIN",
        }).then(() => {
          sendResponse();
        })
        break;
      }
      case "setValueOtherEditor": {
        chrome.scripting.executeScript({
          target: { tabId: _sender.tab?.id ?? 0 },
          func: setValueModel,
          args: [{code: request.code, language: request.language, changes: request.changes}],
          world: "MAIN",
        }).then(() => {
          sendResponse();
        })
        break;
      }

      default:
        console.error(`Unhandled request ${request}`);
        break;
    }

    return true;
  }
);

