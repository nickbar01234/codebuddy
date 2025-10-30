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
    <>
      <Header className="w-[400px] h-fit overflow-hidden pt-2 pb-2 pl-3 pr-3 border-b" />
      <ExtensionSwitch />
    </>
  );
};
