import React from "react";
import AppPanel from "./components/panel";
import { useOnMount } from "./hooks";
import { sendMessage } from "./services";
import { Status } from "./types";
import StateProvider from "@cb/context/StateProvider";
import RootNavigator from "./components/navigator";
import RTCProvider from "./context/RTCProvider";

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
    return null;
  }
};

export default App;
