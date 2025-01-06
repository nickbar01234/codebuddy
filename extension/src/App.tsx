import React from "react";
import { RootNavigator } from "@cb/components/navigator/Navigator";
import { AppPanel } from "@cb/components/panel";
import { RTCProvider } from "@cb/context/RTCProvider";
import { AppStateProvider } from "@cb/context/AppStateProvider";
import { useOnMount } from "@cb/hooks";
import { sendServiceRequest } from "@cb/services";
import { Status } from "@cb/types";
import { PeerSelectionProvider } from "./context/PeerSelectionProvider";

const App = () => {
  const [status, setStatus] = React.useState<Status>({
    status: "UNAUTHENTICATED",
  });

  useOnMount(() => {
    sendServiceRequest({ action: "cookie" }).then(setStatus);
  });

  if (status.status === "AUTHENTICATED") {
    return (
      <AppPanel>
        <AppStateProvider user={status.user}>
          <RTCProvider>
            <PeerSelectionProvider>
              <RootNavigator />
            </PeerSelectionProvider>
          </RTCProvider>
        </AppStateProvider>
      </AppPanel>
    );
  } else {
    // TODO(nickbar01234) - Handle unauthenticated
    return null;
  }
};

export default App;
