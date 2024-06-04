import React from "react";
import AppPanel from "./components/panel";
import { Status } from "@types";
import { useOnMount } from "./hooks";
import { sendMessage } from "@services";

const App = () => {
  const [status, setStatus] = React.useState<Status>({
    status: "UNAUTHENTICATED",
  });

  useOnMount(() => {
    sendMessage({ action: "cookie" }).then(setStatus);
  });

  if (status.status === "AUTHENTICATED") {
    return <AppPanel />;
  } else {
    // TODO(nickbar01234) - Handle unauthenticated
    return null;
  }
};

export default App;
