import Header from "@cb/components/ui/Header";
import { ExtensionSwitch } from "./ExtensionSwitch";

export const Popup = () => {
  return (
    <>
      <Header className="w-[400px] h-fit var(--color-tabset-background) dark:bg-primary overflow-hidden pt-2 pb-2 pl-3 pr-3 border-b" />
      <ExtensionSwitch />
    </>
  );
};
