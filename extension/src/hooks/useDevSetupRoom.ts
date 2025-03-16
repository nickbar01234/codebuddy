import { getGroupRef, getRoomRef, setGroup, setRoom } from "@cb/db";
import { useAppState, useOnMount, useRTC } from ".";
import { arrayRemove, arrayUnion } from "firebase/firestore";
import { getLocalStorage, setLocalStorage } from "@cb/services";
import { getQuestionIdFromUrl } from "@cb/utils";

const useDevSetupRoom = () => {
  const { joinRoom } = useRTC();
  const { user } = useAppState();

  useOnMount(() => {
    if (import.meta.env.MODE !== "development") {
      return;
    }

    const setupRoom = async () => {
      const test = getLocalStorage("test");
      const groupId = test?.groupId;
      const roomId = getQuestionIdFromUrl(window.location.href);
      const groupRef = getGroupRef(groupId);
      await setGroup(groupRef, {
        questions: arrayUnion(roomId),
      });
      if (test != undefined && groupId != undefined) {
        setLocalStorage("test", { peer: test?.peer });
        try {
          await setRoom(getRoomRef(groupId, roomId), {
            usernames: arrayRemove(user.username),
            questionId: getQuestionIdFromUrl(window.location.href),
          });
          joinRoom(groupId);
        } catch (error) {
          console.log("error when removing", error);
        }
      }
    };

    setupRoom();
  });
};

export default useDevSetupRoom;
