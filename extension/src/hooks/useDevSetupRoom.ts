import { getRoomRef, setRoom } from "@cb/db";
import { useAppState, useOnMount, useRTC } from ".";
import { arrayRemove, arrayUnion } from "firebase/firestore";
import { getLocalStorage } from "@cb/services";

const useDevSetupRoom = () => {
  const { joinRoom } = useRTC();
  const { user } = useAppState();

  useOnMount(() => {
    if (import.meta.env.MODE !== "development") {
      return;
    }

    const storedMessage = getLocalStorage("tabs");
    console.log("storedMessage", storedMessage);
    if (storedMessage) {
      if (storedMessage.roomId) {
        setRoom(getRoomRef(storedMessage.roomId), {
          usernames: arrayUnion(user.username),
          questionId: "two-sum",
        })
          .then(() =>
            setRoom(getRoomRef(storedMessage.roomId), {
              usernames: arrayRemove(user.username),
              questionId: "two-sum",
            })
          )
          .then(() => joinRoom(storedMessage.roomId));
      }
    }
  });
};

export default useDevSetupRoom;
