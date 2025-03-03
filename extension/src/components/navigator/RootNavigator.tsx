import { LoadingPanel } from "@cb/components/panel/LoadingPanel";
import SignInPanel from "@cb/components/panel/SignInPanel";
import { AppStateProvider } from "@cb/context/AppStateProvider";
import { PeerSelectionProvider } from "@cb/context/PeerSelectionProvider";
import { RTCProvider } from "@cb/context/RTCProvider";
import { useSession } from "@cb/hooks/index";
import { Status } from "@cb/types";
import { AppNavigator } from "./AppNavigator";

const RootNavigator = () => {
  const { auth } = useSession();
  // useDevReload();

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
