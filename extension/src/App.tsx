import React from "react";
import { RootNavigator } from "@cb/components/navigator/Navigator";
import { AppPanel, SignInPanel } from "@cb/components/panel";
import { RTCProvider } from "@cb/context/RTCProvider";
import { StateProvider } from "@cb/context/StateProvider";
import { useOnMount } from "@cb/hooks";
import { sendMessage } from "@cb/services";
import { Status } from "@cb/types";

const App = () => {
  const [status, setStatus] = React.useState<Status>({
    status: "UNAUTHENTICATED",
  });

  useOnMount(() => {
    sendMessage({ action: "cookie" }).then(setStatus);
  });

  if (status.status === "AUTHENTICATED") {
    return (
      <AppPanel>
        <StateProvider user={status.user}>
          <RTCProvider>
            <RootNavigator />
          </RTCProvider>
        </StateProvider>
      </AppPanel>
    );
  } else {
    // TODO(nickbar01234) - Handle unauthenticated
    return (
      <AppPanel>
        <SignInPanel />
      </AppPanel>
    );
  }
};

export default App;
