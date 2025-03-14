import RootNavigator from "@cb/components/navigator/RootNavigator";
import { AppPanel } from "@cb/components/panel";
import SessionProvider from "./context/SessionProvider";
import { WindowProvider } from "./context/WindowProvider";
import { Toaster } from "sonner";

const App = () => {
  return (
    <WindowProvider>
      <Toaster
        richColors
        expand
        closeButton
        visibleToasts={3}
        toastOptions={{
          duration: 1.5 * 1000,
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
