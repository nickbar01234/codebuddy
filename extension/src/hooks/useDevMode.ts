import { WindowMessage } from "types/window";
import { useOnMount, useRTC } from ".";
import { sendServiceRequest } from "@cb/services";

const useDevMode = () => {
  const { createRoom, joinRoom, leaveRoom } = useRTC();

  useOnMount(() => {
    const onWindowMessage = (message: MessageEvent) => {
      // todo(nickbar01234): Uniquely identify that this is test browser
      if (message.data.action != undefined) {
        const windowMessage = message.data as WindowMessage;
        switch (windowMessage.action) {
          case "createRoom": {
            leaveRoom(windowMessage.roomId).then(() =>
              createRoom({ roomId: windowMessage.roomId })
            );
            break;
          }

          case "joinRoom": {
            leaveRoom(windowMessage.roomId).then(() =>
              joinRoom(windowMessage.roomId)
            );
            break;
          }

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

export default useDevMode;
