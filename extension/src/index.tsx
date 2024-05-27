import React from "react";
import { createRoot } from "react-dom/client";
import "./style/index.css";
import App from "./App";

const root = document.createElement("div");
root.id = "CodeBuddy";

document.body.appendChild(root);

const entry = createRoot(root);

entry.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
