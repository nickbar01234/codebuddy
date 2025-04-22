import RootNavigator from "@cb/components/navigator/RootNavigator";
import { AppPanel } from "@cb/components/panel";
import { Toaster } from "sonner";
import SessionProvider from "./context/SessionProvider";

const App = () => {
  return (
    <>
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
    </>
  );
};

export default App;
