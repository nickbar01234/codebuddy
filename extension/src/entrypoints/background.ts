import { URLS } from "@cb/constants";
import {
  ContentRequest,
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

              if (!results || results.length === 0) {
                sendResponse(
                  servicePayload<"appendTestCaseToLeetCode">({
                    status: ResponseStatus.FAIL,
                    message: "Script execution returned no results",
                  })
                );
                return;
              }

              const result = results[0]?.result;
              console.log("appendTestCaseToLeetCode result:", result);

              if (result && typeof result === "object" && "status" in result) {
                const response = servicePayload<"appendTestCaseToLeetCode">({
                  status:
                    result.status === 0
                      ? ResponseStatus.SUCCESS
                      : ResponseStatus.FAIL,
                  message: (result as any).message,
                });
                console.log("Sending response:", response);
                sendResponse(response);
              } else {
                const response = servicePayload<"appendTestCaseToLeetCode">({
                  status: ResponseStatus.FAIL,
                  message: result
                    ? `Invalid result format: ${JSON.stringify(result)}`
                    : "No result returned from script",
                });
                console.log("Sending error response:", response);
                sendResponse(response);
              }
            })
            .catch((error) => {
              console.error("Failed to append test case:", error);
              const response = servicePayload<"appendTestCaseToLeetCode">({
                status: ResponseStatus.FAIL,
                message: error?.message || String(error) || "Unknown error",
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
