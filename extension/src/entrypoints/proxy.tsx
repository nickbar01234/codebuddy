import { WindowMessage } from "@cb/types";
import { defineUnlistedScript } from "wxt/utils/define-unlisted-script";

export default defineUnlistedScript(() => {
  (function () {
    console.log("Inject proxy");
    if (window.__LC_FETCH_HOOKED__) return;
    window.__LC_FETCH_HOOKED__ = true;

    const origFetch = window.fetch;

    window.fetch = async (...args) => {
      const res = await origFetch(...args);

      try {
        const regexTestResult =
          /^https:\/\/leetcode\.com\/submissions\/detail\/runcode_[^/]+\/check\/$/;

        if (regexTestResult.test(res.url)) {
          const contentType = res.headers.get("content-type") || "";

          if (contentType.includes("application/json")) {
            const clone = res.clone();
            clone
              .json()
              .then((data) => {
                window.postMessage(
                  {
                    source: "LC_SUBMISSION_RESULT",
                    url: res.url,
                    data: data,
                    type: "LC_SUBMISSION_RESULT",
                  },
                  "*"
                );
              })

              .catch((e) => {
                console.error("Failed to parse JSON from LeetCode response", e);
              });
          }
        }
      } catch (e) {
        console.error("Error in fetch hook:", e);
      }
      return res;
    };
  })();

  window.addEventListener("message", (message: MessageEvent<WindowMessage>) => {
    if (message.data.action == undefined) {
      return;
    }
    const action = message.data.action;
    switch (action) {
      case "navigate": {
        const { url } = message.data;
        window.next?.router.push(url);
        break;
      }

      case "leetCodeOnChange": {
        break;
      }

      default:
        assertUnreachable(action);
    }
  });
});
