import { Status } from "@cb/types";
import SignInPanel from "@cb/components/panel/SignInPanel";
import useDevReload from "@cb/hooks/useDevReload";
import { useSession } from "@cb/hooks/index";
import { RTCProvider } from "@cb/context/RTCProvider";
import { PeerSelectionProvider } from "@cb/context/PeerSelectionProvider";
import { AppNavigator } from "./AppNavigator";
import { LoadingPanel } from "@cb/components/panel/LoadingPanel";
import { AppStateProvider } from "@cb/context/AppStateProvider";

const RootNavigator = () => {
  const { auth } = useSession();
  useDevReload();

  switch (auth.status) {
    case Status.AUTHENTICATED:
      return (
        <AppStateProvider user={auth.user}>
          <RTCProvider>
            <PeerSelectionProvider>
              <AppNavigator />
            </PeerSelectionProvider>
          </RTCProvider>
        </AppStateProvider>
      );

    case Status.UNAUTHENTICATED:
      return <SignInPanel />;

    case Status.LOADING:
      return <LoadingPanel numberOfUsers={0} />;
  }
};

export default RootNavigator;
