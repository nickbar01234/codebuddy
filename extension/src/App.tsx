import React from "react";
import RootNavigator from "@cb/components/navigator/RootNavigator";
import { AppPanel } from "@cb/components/panel";
import SessionProvider from "./context/SessionProvider";
<<<<<<< HEAD
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
=======

const App = () => {
  return (
    <AppPanel>
      <SessionProvider>
        <RootNavigator />
      </SessionProvider>
    </AppPanel>
>>>>>>> 7a16449 (Sign in with email link)
  );
};

export default App;
