import { LoadingPanel } from "@cb/components/panel/LoadingPanel";
import SignInPanel from "@cb/components/panel/SignInPanel";
import { AppStateProvider } from "@cb/context/AppStateProvider";
import { PeerSelectionProvider } from "@cb/context/PeerSelectionProvider";
import { RTCProvider } from "@cb/context/RTCProvider";
import { Status, useApp } from "@cb/store";
import { AppNavigator } from "./AppNavigator";
import { ContainerNavigator } from "./ContainerNavigator";
import { AppControlMenu, RoomControlMenu } from "./menu";

const RootNavigator = () => {
  const auth = useApp((state) => state.auth);

  switch (auth.status) {
    case Status.AUTHENTICATED:
      return (
        <AppStateProvider user={auth.user}>
          <RTCProvider>
            <PeerSelectionProvider>
              <ContainerNavigator menu={<RoomControlMenu />}>
                <AppNavigator />
              </ContainerNavigator>
            </PeerSelectionProvider>
          </RTCProvider>
        </AppStateProvider>
      );

    case Status.UNAUTHENTICATED:
      return (
        <ContainerNavigator menu={<AppControlMenu />}>
          <SignInPanel />
        </ContainerNavigator>
      );

    case Status.LOADING:
      return (
        <ContainerNavigator menu={<AppControlMenu />}>
          <LoadingPanel numberOfUsers={0} />
        </ContainerNavigator>
      );
  }
};

export default RootNavigator;
