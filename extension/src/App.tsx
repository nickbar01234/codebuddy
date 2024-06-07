import AppPanel from "./components/panel";
import MonacoProvider from "./context/MonacoProvider";
import RTCProvider from "./context/RTCProvider";
import UserProvider from "./context/UserProvider";
import { useOnMount } from "./hooks";
import { sendMessage } from "./services";
import { Status } from "./types";
import React from "react";

const App = () => {
  const [status, setStatus] = React.useState<Status>({
    status: "UNAUTHENTICATED",
  });

  useOnMount(() => {
    sendMessage({ action: "cookie" }).then(setStatus);
  });

  if (status.status === "AUTHENTICATED") {
    return (
      <UserProvider user={status.user}>
        <RTCProvider>
          <MonacoProvider>
            <AppPanel />;
          </MonacoProvider>
        </RTCProvider>
      </UserProvider>
    );
  } else {
    // TODO(nickbar01234) - Handle unauthenticated
    return null;
  }
};

export default App;
