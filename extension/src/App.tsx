import React from "react";
import { RootNavigator } from "@cb/components/navigator/Navigator";
import { AppPanel, SignInPanel } from "@cb/components/panel";
import { RTCProvider } from "@cb/context/RTCProvider";
import { StateProvider } from "@cb/context/StateProvider";
import { useOnMount } from "@cb/hooks";
import { sendMessage } from "@cb/services";
import { Status } from "@cb/types";
import { auth } from "./db";

const App = () => {
  const [status, setStatus] = React.useState<Status>({
    status: "UNAUTHENTICATED",
  });

  useOnMount(() =>
    auth.onAuthStateChanged((user) => {
      if (user == null) {
        setStatus({ status: "UNAUTHENTICATED" });
      } else {
        setStatus({
          status: "AUTHENTICATED",
          user: { ...user, username: user.displayName ?? user.email! },
        });
      }
    })
  );

  return (
    <AppPanel>
      {status.status === "AUTHENTICATED" ? (
        <StateProvider user={status.user}>
          <RTCProvider>
            <RootNavigator />
          </RTCProvider>
        </StateProvider>
      ) : (
        <SignInPanel />
      )}
    </AppPanel>
  );
};

export default App;
