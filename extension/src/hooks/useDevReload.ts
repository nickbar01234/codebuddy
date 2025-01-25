import { WindowMessage } from "types/window";
import { useOnMount } from ".";
import { sendServiceRequest } from "@cb/services";

const useDevReload = () => {
  useOnMount(() => {
    if (import.meta.env.MODE !== "development") {
      return;
    }
    const onWindowMessage = (message: MessageEvent) => {
      // todo(nickbar01234): Uniquely identify that this is test browser
      if (message.data.action != undefined) {
        const windowMessage = message.data as WindowMessage;
        switch (windowMessage.action) {
          case "reloadExtension": {
            sendServiceRequest({ action: "reloadExtension" });
            break;
          }
        }
      }
    };
    window.addEventListener("message", onWindowMessage);
    return () => window.removeEventListener("message", onWindowMessage);
  });
};

export default useDevReload;
