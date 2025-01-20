import React from "react";
import { RootNavigator } from "@cb/components/navigator/Navigator";
import { AppPanel } from "@cb/components/panel";
import { RTCProvider } from "@cb/context/RTCProvider";
import { AppStateProvider } from "@cb/context/AppStateProvider";
import { useOnMount } from "@cb/hooks";
import { getLocalStorage, sendServiceRequest } from "@cb/services";
import { Status } from "@cb/types";
import { PeerSelectionProvider } from "./context/PeerSelectionProvider";

const App = () => {
  const [status, setStatus] = React.useState<Status>({
    status: "UNAUTHENTICATED",
  });

  useOnMount(() => {
    sendServiceRequest({ action: "cookie" }).then((status) => {
      const fakeUser = getLocalStorage("test");
      if (status.status === "AUTHENTICATED") {
        setStatus(status);
      } else if (fakeUser != undefined) {
        const { peer } = fakeUser;
        setStatus({
          status: "AUTHENTICATED",
          user: { username: peer, id: peer },
        });
      }
    });
  });

  if (status.status === "AUTHENTICATED") {
    return (
      <AppStateProvider user={status.user}>
        <RTCProvider>
          <PeerSelectionProvider>
            <AppPanel>
              <RootNavigator />
            </AppPanel>
          </PeerSelectionProvider>
        </RTCProvider>
      </AppStateProvider>
    );
  } else {
    // TODO(nickbar01234) - Handle unauthenticated
    return null;
  }
};

export default App;
