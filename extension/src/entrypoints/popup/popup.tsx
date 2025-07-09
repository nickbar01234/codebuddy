import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { isContentScriptRegistered } from "webext-dynamic-content-scripts/utils.js";

const SCRIPT_ID = "codebuddy-extension";
const MATCH_URL = "https://leetcode.com/problems/*";
const JS_FILES = ["content-scripts/content.js"];

const Popup = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    chrome.scripting.getRegisteredContentScripts().then((scripts) => {
      setEnabled(scripts.some((s) => s.id === SCRIPT_ID));
    });
  }, []);

  const toggleExtension = async () => {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (!tab?.id) return;

    if (!enabled) {
      const alreadyRegistered = await isContentScriptRegistered(MATCH_URL);
      console.log("Already registered?", alreadyRegistered);

      if (!alreadyRegistered) {
        await chrome.scripting.registerContentScripts([
          {
            id: SCRIPT_ID,
            matches: [MATCH_URL],
            js: JS_FILES,
            runAt: "document_end",
          },
        ]);
      }

      // Inject into current tab
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: JS_FILES,
      });

      setEnabled(true);
      const current = await chrome.scripting.getRegisteredContentScripts();
      console.log("current", current);
    } else {
      // Unregister and cleanup
      await chrome.scripting.unregisterContentScripts({ ids: [SCRIPT_ID] });
      const remaining = await chrome.scripting.getRegisteredContentScripts();
      console.log("Remaining", remaining);

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // need to figure out correct way
          const panel = document.getElementById("resizable-panel-collapsible");
          if (panel) {
            panel.remove();
          }
        },
      });

      setEnabled(false);
    }
  };

  return (
    <button onClick={toggleExtension}>
      {enabled ? "Disable Codebuddy" : "Enable Codebuddy"}
    </button>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<Popup />);
