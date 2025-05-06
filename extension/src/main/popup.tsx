import { generateId } from "@cb/utils";
import React from "react";
import { createRoot } from "react-dom/client";

const root = document.createElement("div");
root.id = generateId("root");

document.body.append(root);

createRoot(root).render(
  <React.StrictMode>
    <div>hello world</div>
  </React.StrictMode>
);
