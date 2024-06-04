import { jsx as _jsx } from "react/jsx-runtime";
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { waitForElement } from "./utils";
import "./style/index.css";
import "react-resizable/css/styles.css";
import "./userWorker";
const TIME_OUT = 2000; // ms
const LEETCODE_ROOT_ID = "#qd-content";
const EXTENSION_ID = "CodeBuddy";
waitForElement(LEETCODE_ROOT_ID, TIME_OUT)
    .then((leetCodeNode) => {
    const extensionRoot = document.createElement("div");
    extensionRoot.id = EXTENSION_ID;
    leetCodeNode.insertAdjacentElement("afterend", extensionRoot);
    createRoot(extensionRoot).render(_jsx(React.StrictMode, { children: _jsx(App, {}) }));
})
    .catch((_reason) => console.error(`Unable to mount ${EXTENSION_ID} within ${TIME_OUT}ms - most likely due to LeetCode changing HTML page`));
