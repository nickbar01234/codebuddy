import React from "react";
import RootNavigator from "@cb/components/navigator/RootNavigator";
import { AppPanel } from "@cb/components/panel";
import SessionProvider from "./context/SessionProvider";
import { WindowProvider } from "./context/WindowProvider";

const App = () => {
  return (
    <WindowProvider>
      <AppPanel>
        <SessionProvider>
          <RootNavigator />
        </SessionProvider>
      </AppPanel>
    </WindowProvider>
  );
};

export default App;
