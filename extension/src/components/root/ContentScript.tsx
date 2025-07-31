import RootNavigator from "@cb/components/navigator/RootNavigator";
import { ResizableGroupLayoutPanel } from "@cb/components/panel/ResizableGroupLayoutPanel";
import SessionProvider from "@cb/context/SessionProvider";
import { useContentScriptMessages } from "@cb/hooks/messages/useContentScriptMessages";
import React from "react";
import { Toaster } from "sonner";

interface ContentProps {
  leetCodeNode: Element;
}

export const ContentScript = ({ leetCodeNode }: ContentProps) => {
  useContentScriptMessages();

  return (
    <React.StrictMode>
      <Toaster
        richColors
        expand
        closeButton
        visibleToasts={3}
        toastOptions={{
          duration: 5 * 1000,
        }}
      />
      <SessionProvider>
        <ResizableGroupLayoutPanel leetCodeRoot={leetCodeNode}>
          <RootNavigator />
        </ResizableGroupLayoutPanel>
      </SessionProvider>
    </React.StrictMode>
  );
};
