import { getRoomRef, setRoom } from "@cb/db";
import { useAppState, useOnMount, useRTC } from ".";
import { arrayRemove, arrayUnion } from "firebase/firestore";
import { getLocalStorage } from "@cb/services";
import { getQuestionIdFromUrl } from "@cb/utils";

const useDevSetupRoom = () => {
  const { joinRoom } = useRTC();
  const { user } = useAppState();

  useOnMount(() => {
    if (import.meta.env.MODE !== "development") {
      return;
    }

    const storedMessage = getLocalStorage("roomMessage");
    if (storedMessage?.roomId !== undefined) {
      setRoom(getRoomRef(storedMessage.roomId), {
        usernames: arrayRemove(user.username),
        questionId: getQuestionIdFromUrl(window.location.href),
      })
        .then(() => joinRoom(storedMessage.roomId))
        .catch((error) => {
          console.log("error when removing", error);
        });
    }
  });
};

export default useDevSetupRoom;
