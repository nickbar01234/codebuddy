import { AppNavigator } from "@cb/components/navigator/AppNavigator";
import { ContainerNavigator } from "@cb/components/navigator/ContainerNavigator";
import { AppControlMenu, RoomControlMenu } from "@cb/components/navigator/menu";
import { LoadingPanel } from "@cb/components/panel/LoadingPanel";
import { ResizableGroupLayoutPanel } from "@cb/components/panel/ResizableGroupLayoutPanel";
import SignInPanel from "@cb/components/panel/SignInPanel";
import { PeerSelectionProvider } from "@cb/context/PeerSelectionProvider";
import { useContentScriptMessages } from "@cb/hooks/messages/useContentScriptMessages";
import { AppStatus, useApp } from "@cb/store";
import React from "react";
import { Toaster } from "sonner";

interface ContentProps {
  leetCodeNode: Element;
}

export const ContentScript = ({ leetCodeNode }: ContentProps) => {
  const auth = useApp((state) => state.auth);

  useContentScriptMessages();
  useAuthenticate({});

  const root = React.useMemo(() => {
    switch (auth.status) {
      case AppStatus.AUTHENTICATED:
        return (
          <PeerSelectionProvider>
            <ContainerNavigator menu={<RoomControlMenu />}>
              <AppNavigator />
            </ContainerNavigator>
          </PeerSelectionProvider>
        );
      case AppStatus.UNAUTHENTICATED:
        return (
          <ContainerNavigator menu={<AppControlMenu />}>
            <SignInPanel />
          </ContainerNavigator>
        );
      case AppStatus.LOADING:
        return (
          <ContainerNavigator menu={<AppControlMenu />}>
            <LoadingPanel numberOfUsers={0} />
          </ContainerNavigator>
        );
    }
  }, [auth]);

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
      <ResizableGroupLayoutPanel leetCodeRoot={leetCodeNode}>
        {root}
      </ResizableGroupLayoutPanel>
    </React.StrictMode>
  );
};
