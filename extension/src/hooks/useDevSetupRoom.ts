import { getRoomRef, setRoom } from "@cb/db";
import { WindowMessage } from "types/window";
import { useOnMount, useRTC } from ".";
import { getQuestionIdFromUrl } from "@cb/utils";

const useDevSetupRoom = () => {
  const { createRoom, joinRoom, leaveRoom } = useRTC();

  useOnMount(() => {
    if (import.meta.env.MODE !== "development") {
      return;
    }

    const unsafeResetRoom = (groupId: string) =>
      setRoom(getRoomRef(groupId, getQuestionIdFromUrl(window.location.href)), {
        usernames: [],
      });

    const onWindowMessage = (message: MessageEvent) => {
      // todo(nickbar01234): Uniquely identify that this is test browser
      if (message.data.action != undefined) {
        const windowMessage = message.data as WindowMessage;
        switch (windowMessage.action) {
          case "createRoom": {
            unsafeResetRoom(windowMessage.groupId).then(() =>
              createRoom({ roomId: windowMessage.groupId })
            );
            break;
          }

          case "joinRoom": {
            leaveRoom(windowMessage.groupId).then(() =>
              joinRoom(windowMessage.groupId)
            );
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
