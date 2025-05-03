import { generateId, waitForElement } from "@cb/utils";
import React from "react";
import { createRoot } from "react-dom/client";
import "react-resizable/css/styles.css";
import App from "./App";
import "./style/index.css";

const TIME_OUT = 5000; // ms
const LEETCODE_ROOT_ID = "#qd-content";

waitForElement(LEETCODE_ROOT_ID, TIME_OUT)
  .then((leetCodeNode) => {
    const extensionRoot = document.createElement("div");
    extensionRoot.id = generateId("root");
    leetCodeNode.insertAdjacentElement("afterend", extensionRoot);
    createRoot(extensionRoot).render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch(() =>
    console.error(
      `Unable to mount Codebuddy within ${TIME_OUT}ms - most likely due to LeetCode changing HTML page`
    )
  );
