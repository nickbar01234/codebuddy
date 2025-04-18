import RootNavigator from "@cb/components/navigator/RootNavigator";
import { AppPanel } from "@cb/components/panel";
import { Toaster } from "sonner";
import SessionProvider from "./context/SessionProvider";
import { WindowProvider } from "./context/WindowProvider";

const App = () => {
  return (
    <WindowProvider>
      <Toaster
        richColors
        expand
        closeButton
        visibleToasts={3}
        toastOptions={{
          duration: 5 * 1000,
        }}
      />
      <AppPanel>
        <SessionProvider>
          <RootNavigator />
        </SessionProvider>
      </AppPanel>
    </WindowProvider>
  );
};

export default App;
