import { getRoomRef, setRoom } from "@cb/db";
import { useAppState, useOnMount, useRTC } from ".";
import { arrayRemove } from "firebase/firestore";
import { getLocalStorage, setLocalStorage } from "@cb/services";
import { getQuestionIdFromUrl } from "@cb/utils";
import { poll } from "@cb/utils/poll";

const useDevSetupRoom = () => {
  const { joinRoom } = useRTC();
  const { user } = useAppState();

  useOnMount(() => {
    if (import.meta.env.MODE !== "development") {
      return;
    }
    const setupRoom = async () => {
      const test = await poll({
        fn: async () => getLocalStorage("test"),
        until: (test) => test != null,
        ms: 100,
      });

      const roomId = test?.roomId;
      if (test != undefined && roomId != undefined) {
        setLocalStorage("test", { peer: test?.peer });
        setRoom(getRoomRef(roomId), {
          usernames: arrayRemove(user.username),
          questionId: getQuestionIdFromUrl(window.location.href),
        })
          .then(() => joinRoom(roomId))
          .catch((error) => {
            console.log("error when removing", error);
          });
      }
    };

    setupRoom();
  });
};

export default useDevSetupRoom;
