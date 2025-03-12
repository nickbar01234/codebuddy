import { getRoomRef, setRoom } from "@cb/db";
import { useOnMount, useRTC } from ".";

const useDevSetupRoom = () => {
  const { createRoom, joinRoom, leaveRoom } = useRTC();

  useOnMount(() => {
    if (import.meta.env.MODE !== "development") {
      return;
    }

    const unsafeResetRoom = (roomId: string) =>
      setRoom(getRoomRef(roomId), { usernames: [] });
    const storedMessage = localStorage.getItem("roomMessage");
    if (storedMessage) {
      const message = JSON.parse(storedMessage);
      switch (message.action) {
        case "createRoom": {
          unsafeResetRoom(message.roomId).then(() =>
            createRoom({ roomId: message.roomId })
          );
          console.log("Create room case useDevsetup");
          break;
        }
        case "joinRoom": {
          leaveRoom(message.roomId).then(() => joinRoom(message.roomId));
          console.log("join room case use dev set up room");
          break;
        }
      }
    }
  });
};

export default useDevSetupRoom;
