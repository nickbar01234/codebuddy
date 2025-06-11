import RootNavigator from "@cb/components/navigator/RootNavigator";
import { AppPanel } from "@cb/components/panel";
import SessionProvider from "@cb/context/SessionProvider";
import { WindowProvider } from "@cb/context/WindowProvider";
import { store } from "@cb/state/store";
import "@cb/style/index.css";
import { generateId, waitForElement } from "@cb/utils";
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "react-resizable/css/styles.css";
import { Toaster } from "sonner";

const TIME_OUT = 5000; // ms
const LEETCODE_ROOT_ID = "#qd-content";

waitForElement(LEETCODE_ROOT_ID, TIME_OUT)
  .then((leetCodeNode) => {
    const extensionRoot = document.createElement("div");
    extensionRoot.id = generateId("root");
    leetCodeNode.insertAdjacentElement("afterend", extensionRoot);
    createRoot(extensionRoot).render(
      <React.StrictMode>
        <Provider store={store}>
          <WindowProvider>
            <Toaster
              richColors
              expand
              closeButton
              visibleToasts={3}
              toastOptions={{
                duration: 5 * 1000,
              }}
            />
            <AppPanel>
              <SessionProvider>
                <RootNavigator />
              </SessionProvider>
            </AppPanel>
          </WindowProvider>
        </Provider>
      </React.StrictMode>
    );
  })
  .catch(() =>
    console.error(
      `Unable to mount Codebuddy within ${TIME_OUT}ms - most likely due to LeetCode changing HTML page`
    )
  );
