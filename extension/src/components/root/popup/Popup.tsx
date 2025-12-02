import Header from "@cb/components/ui/Header";
import React from "react";
import { ExtensionSwitch } from "./ExtensionSwitch";

const MEDIA_SELECTOR = window.matchMedia("(prefers-color-scheme: dark)");

export const Popup = () => {
  React.useEffect(() => {
    const applySystemTheme = () => {
      const isDark = MEDIA_SELECTOR.matches;
      document.documentElement.classList.toggle("dark", isDark);
      document.documentElement.style.colorScheme = isDark ? "dark" : "light";
    };

    applySystemTheme();

    MEDIA_SELECTOR.addEventListener("change", applySystemTheme);

    return () => MEDIA_SELECTOR.removeEventListener("change", applySystemTheme);
  });

  return (
    <div className="bg-secondary w-[300px]">
      <Header className="py-2 px-3 bg-tabbar" />
      <ExtensionSwitch />
    </div>
  );
};
