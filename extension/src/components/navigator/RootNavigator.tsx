import { LoadingPanel } from "@cb/components/panel/LoadingPanel";
import SignInPanel from "@cb/components/panel/SignInPanel";
import { AppStateProvider } from "@cb/context/AppStateProvider";
import { HeartBeatProvider } from "@cb/context/HeartBeatProvider";
import { PeerSelectionProvider } from "@cb/context/PeerSelectionProvider";
import { RTCProvider } from "@cb/context/RTCProvider";
import { useSession } from "@cb/hooks/index";
import useDevReload from "@cb/hooks/useDevReload";
import { Status } from "@cb/types";
import { AppNavigator } from "./AppNavigator";
import { ContainerNavigator } from "./ContainerNavigator";
import { AppControlMenu, RoomControlMenu } from "./menu";

const RootNavigator = () => {
  const { auth } = useSession();
  useDevReload();

  switch (auth.status) {
    case Status.AUTHENTICATED:
      return (
        <AppStateProvider user={auth.user}>
          <RTCProvider>
            <PeerSelectionProvider>
              <ContainerNavigator menu={<RoomControlMenu />}>
                <HeartBeatProvider>
                  <AppNavigator />
                </HeartBeatProvider>
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
