import { getSession, getSessionRef } from "@cb/db";
import { useAppState, useRTC } from "@cb/hooks/index";
import useResource from "@cb/hooks/useResource";
import { constructUrlFromQuestionId, getQuestionIdFromUrl } from "@cb/utils";
import { onSnapshot, Unsubscribe } from "firebase/firestore";
import React from "react";
import { toast } from "sonner";
import { Choose } from "./stage/Choose";
import { Decision } from "./stage/Decision";
import { Wait } from "./stage/Wait";

export enum ROOMSTATE {
  CODE,
  CHOOSE,
  WAIT,
  DECISION,
}

export const RoomInfoTab = () => {
  const {
    register: registerSnapshot,
    get: getSnapshot,
    cleanup: cleanupSnapshot,
  } = useResource<Unsubscribe>({ name: "snapshot" });
  const {
    user: { username },
  } = useAppState();
  const { roomId } = useRTC();
  const sessionId = getQuestionIdFromUrl(window.location.href);
  const [roomState, setRoomState] = React.useState<ROOMSTATE>(ROOMSTATE.CODE);

  React.useEffect(() => {
    if (roomId != null && getSnapshot()[roomId] == undefined) {
      const unsubscribe = onSnapshot(
        getSessionRef(roomId, sessionId),
        async (snapshot) => {
          const data = snapshot.data();
          // todo(nickbar01234): Clear and report room if deleted?
          if (data == undefined) return;

          const usernames = data.usernames;
          const sessionDoc = await getSession(roomId, sessionId);
          const sessionData = sessionDoc.data();
          if (!sessionData) return;

          const nextQuestionChosen = sessionData.nextQuestion !== "";
          const finishedUsers = sessionData.finishedUsers;
          if (!nextQuestionChosen) {
            if (
              finishedUsers.length !== 0 &&
              finishedUsers.includes(username)
            ) {
              setRoomState(ROOMSTATE.CHOOSE);
            }
          } else {
            if (usernames.every((user) => finishedUsers.includes(user))) {
              toast.info(
                "All users have finished the question. " +
                  "Navigating to the next question: " +
                  constructUrlFromQuestionId(sessionData.nextQuestion)
              );
              setRoomState(ROOMSTATE.DECISION);
            } else if (finishedUsers.includes(username)) {
              setRoomState(ROOMSTATE.WAIT);
            }
          }
        }
      );
      registerSnapshot(roomId, unsubscribe, (prev) => prev());
    }
    return () => cleanupSnapshot();
  }, [
    roomId,
    sessionId,
    registerSnapshot,
    username,
    getSnapshot,
    cleanupSnapshot,
  ]);
  return (
    <div className="h-full w-full ">
      {roomState === ROOMSTATE.WAIT && <Wait />}
      {roomState === ROOMSTATE.CHOOSE && <Choose />}
      {roomState === ROOMSTATE.DECISION && <Decision />}
    </div>
  );
};
