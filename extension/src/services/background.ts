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
    setStorage({ editorPreference: { width: 300 /* px */ } });
  }
});

/**
 * TODO(nickbar01234) - Redesign authentication flow
 *
 * @docs https://stackoverflow.com/a/61056192
 */
const waitiingToLoad = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  while ((window as any).monaco) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

const getValue = async () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userEditor = (window as any).monaco.editor.getModels()[0];
  return userEditor.getValue();
}

const setValue = async (value: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const userEditor = (window as any).monaco.editor.getModels()[0];
  userEditor.setValue(value);
}

chrome.runtime.onMessage.addListener(
  (request: ServiceRequest, _sender, sendResponse) => {
    console.dir(chrome.webNavigation)
    console.debug("Receiving", request);
    // setTimeout(() => {
    //   chrome.scripting.executeScript({
    //     target: { tabId: _sender.tab?.id ?? 0 },
    //     func: () => {
    //       // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //       (window as any).monaco.editor.getModels()[0].onDidChangeContent((event: any) => {
    //         console.dir(event);
    //       })
    //     },
    //     world: "MAIN",
    //   })
    // }, 1000);
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
      default:
        console.error(`Unhandled request ${request}`);
        break;
    }

    return true;
  }
);

