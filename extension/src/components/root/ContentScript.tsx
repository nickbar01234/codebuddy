import RootNavigator from "@cb/components/navigator/RootNavigator";
import { ResizableGroupLayoutPanel } from "@cb/components/panel/ResizableGroupLayoutPanel";
import SessionProvider from "@cb/context/SessionProvider";
import { useContentScriptMessages } from "@cb/hooks/messages/useContentScriptMessages";
import { store } from "@cb/state/store";
import React from "react";
import { Provider } from "react-redux";
import { Toaster } from "sonner";

interface ContentProps {
  leetCodeNode: Element;
}

export const ContentScript = ({ leetCodeNode }: ContentProps) => {
  useContentScriptMessages();

  return (
    <React.StrictMode>
      <Provider store={store}>
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
      </Provider>
    </React.StrictMode>
  );
};
