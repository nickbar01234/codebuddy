import RootNavigator from "@cb/components/navigator/RootNavigator";
import { ResizableGroupLayoutPanel } from "@cb/components/panel/ResizableGroupLayoutPanel";
import SessionProvider from "@cb/context/SessionProvider";
import { store } from "@cb/state/store";
import "@cb/style/index.css";
import { waitForElement } from "@cb/utils";
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "react-resizable/css/styles.css";
import { Toaster } from "sonner";

const TIME_OUT = 5000; // ms
const LEETCODE_ROOT_ID = "#qd-content";

export default defineContentScript({
  matches: ["https://leetcode.com/problems/*"],
  runAt: "document_end",
  main() {
    waitForElement(LEETCODE_ROOT_ID, TIME_OUT)
      .then((leetCodeNode) => {
        const extensionRoot = document.createElement("div");
        leetCodeNode.insertAdjacentElement("afterend", extensionRoot);
        extensionRoot.classList.add("relative", "h-full", "w-full");

        const leetCodeRoot = document.createElement("div");
        leetCodeRoot.appendChild(leetCodeNode);

        createRoot(extensionRoot).render(
          <React.StrictMode>
            <Provider store={store}>
              <Toaster
                richColors
                expand
                closeButton
                visibleToasts={3}
                toastOptions={{
                  duration: 5 * 1000,
                }}
              />
              <SessionProvider>
                <ResizableGroupLayoutPanel leetCodeRoot={leetCodeNode}>
                  <RootNavigator />
                </ResizableGroupLayoutPanel>
              </SessionProvider>
            </Provider>
          </React.StrictMode>
        );
      })
      .catch(() =>
        console.error(
          `Unable to mount Codebuddy within ${TIME_OUT}ms - most likely due to LeetCode changing HTML page`
        )
      );
  },
});
