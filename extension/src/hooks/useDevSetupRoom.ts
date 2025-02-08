import { WindowMessage } from "types/window";
import { useOnMount, useRTC } from ".";
import { sendServiceRequest } from "@cb/services";
import { getRoomRef, setRoom } from "@cb/db";

const useDevSetupRoom = () => {
  const { createRoom, joinRoom, leaveRoom } = useRTC();

  useOnMount(() => {
    if (import.meta.env.MODE !== "development") {
      return;
    }

    const unsafeResetRoom = (roomId: string) =>
      setRoom(getRoomRef(roomId), { usernames: [] });

    const onWindowMessage = (message: MessageEvent) => {
      // todo(nickbar01234): Uniquely identify that this is test browser
      if (message.data.action != undefined) {
        const windowMessage = message.data as WindowMessage;
        switch (windowMessage.action) {
          case "createRoom": {
            unsafeResetRoom(windowMessage.roomId).then(() =>
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

export default useDevSetupRoom;
