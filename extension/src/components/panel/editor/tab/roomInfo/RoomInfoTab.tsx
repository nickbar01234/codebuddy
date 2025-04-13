import { getRoom, getSession, getSessionRef } from "@cb/db";
import { Room, Session } from "@cb/db/converter";
import { useAppState, useRTC } from "@cb/hooks/index";
import useResource from "@cb/hooks/useResource";
import { constructUrlFromQuestionId, getQuestionIdFromUrl } from "@cb/utils";
import { formatTime } from "@cb/utils/heartbeat";
import { onSnapshot, Unsubscribe } from "firebase/firestore";
import { Timer, Users } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { Choose } from "./stage/Choose";
import { Decision } from "./stage/Decision";
import { Wait } from "./stage/Wait";

export enum ROOMSTATE {
  BEGIN,
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
  const { roomId, peerState } = useRTC();
  const sessionId = React.useMemo(
    () => getQuestionIdFromUrl(window.location.href),
    []
  );
  const [roomState, setRoomState] = React.useState<ROOMSTATE>(ROOMSTATE.BEGIN);
  const [roomDoc, setRoomDoc] = React.useState<Room | null>(null);
  const [sessionDoc, setSessionDoc] = React.useState<Session | null>(null);

  React.useEffect(() => {
    async function fetchRoomInfo() {
      if (roomId == null) return;
      const sessionDoc = await getSession(roomId, sessionId);
      const roomDoc = await getRoom(roomId);
      const roomData = roomDoc.data();
      const sessionData = sessionDoc.data();
      if (sessionData && roomData) {
        setRoomDoc(roomData);
        setSessionDoc(sessionData as Session);
      }
    }
    fetchRoomInfo();
  }, [roomId, sessionId]);

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
    <div className="h-full w-full flex-col items-center justify-center ">
      <h1 className="mb-4 text-center text-lg font-semibold text-black dark:text-white">
        {roomDoc?.roomName ?? "Room Name"}
      </h1>
      <div className="w-full flex items-center">
        <div className="flex items-center">
          <Users className="mr-2" />
          <span className="text-sm font-medium text-tertiary">
            {Object.keys(peerState).length}/4
          </span>
        </div>
        <div className="flex items-center">
          <Timer className="mr-2" />
          <span className="text-sm font-medium text-tertiary">
            {formatTime(
              Date.now() - (sessionDoc?.createdAt?.toDate()?.getTime() ?? 0)
            )}
          </span>
        </div>
      </div>
      <div className="flex flex-col w-full">
        <h1 className="text-tertiary"> Next Problem</h1>
        <h1 className="text-tertiary">
          {sessionDoc?.nextQuestion != ""
            ? sessionDoc?.nextQuestion
            : "No next problem"}
        </h1>
      </div>

      {roomState === ROOMSTATE.WAIT && <Wait />}
      {roomState === ROOMSTATE.CHOOSE && <Choose />}
      {roomState === ROOMSTATE.DECISION && <Decision />}
    </div>
  );
};
