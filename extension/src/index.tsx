import { store } from "@cb/state/store";
import { waitForElement } from "@cb/utils";
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import "react-resizable/css/styles.css";
import App from "./App";
import { WindowListener } from "./components/listeners/WindowListener";
import "./style/index.css";

const TIME_OUT = 5000; // ms
const LEETCODE_ROOT_ID = "#qd-content";
const EXTENSION_ID = "CodeBuddy";

waitForElement(LEETCODE_ROOT_ID, TIME_OUT)
  .then((leetCodeNode) => {
    const extensionRoot = document.createElement("div");
    extensionRoot.id = EXTENSION_ID;
    leetCodeNode.insertAdjacentElement("afterend", extensionRoot);
    createRoot(extensionRoot).render(
      <React.StrictMode>
        <Provider store={store}>
          <WindowListener />
          <App />
        </Provider>
      </React.StrictMode>
    );
  })
  .catch((_reason) =>
    console.error(
      `Unable to mount ${EXTENSION_ID} within ${TIME_OUT}ms - most likely due to LeetCode changing HTML page`
    )
  );
