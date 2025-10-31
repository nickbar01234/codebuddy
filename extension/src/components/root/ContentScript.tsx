import { AppNavigator } from "@cb/components/navigator/AppNavigator";
import { ContainerNavigator } from "@cb/components/navigator/ContainerNavigator";
import { AppControlMenu, RoomControlMenu } from "@cb/components/navigator/menu";
import { BottomBannerPanel } from "@cb/components/panel/BottomBannerPanel";
import { LoadingPanel } from "@cb/components/panel/LoadingPanel";
import { ResizablePanel } from "@cb/components/panel/ResizablePanel";
import SignInPanel from "@cb/components/panel/SignInPanel";
import { useAuthenticate } from "@cb/hooks/auth";
import { useToast } from "@cb/hooks/toasts";
import { AppStatus, useApp } from "@cb/store";
import React from "react";
import { Toaster } from "sonner";

export const ContentScript = () => {
  const auth = useApp((state) => state.auth);

  useAuthenticate({});
  useToast();

  const root = React.useMemo(() => {
    switch (auth.status) {
      case AppStatus.AUTHENTICATED:
        return (
          <ContainerNavigator menu={<RoomControlMenu />}>
            <BottomBannerPanel>
              <AppNavigator />
            </BottomBannerPanel>
          </ContainerNavigator>
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
      <ResizablePanel>{root}</ResizablePanel>
    </React.StrictMode>
  );
};
