import { getRoomRef, getSessionRef, setRoom, setSession } from "@cb/db";
import { useAppState, useOnMount, useRTC } from ".";
import { arrayRemove, arrayUnion, serverTimestamp } from "firebase/firestore";

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
      const sessionId = getQuestionIdFromUrl(window.location.href);
      const roomRef = getRoomRef(roomId);
      await setRoom(roomRef, {
        usernames: arrayUnion(user.username),
      });
      if (test != undefined && roomId != undefined) {
        setLocalStorage("test", { peer: test?.peer });
        try {
          await setSession(getSessionRef(roomId, sessionId), {
            usernames: arrayRemove(user.username),
            createdAt: serverTimestamp(),
          });
          joinRoom(roomId);
        } catch (error) {
          console.log("error when removing", error);
        }
      }
    };

    setupRoom();
  });
};

export default useDevSetupRoom;
