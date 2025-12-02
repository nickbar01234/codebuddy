import { Popup } from "@cb/components/root/popup";
import "@cb/style/index.css";
import React from "react";
import { createRoot } from "react-dom/client";

createRoot(document.body).render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>
);
