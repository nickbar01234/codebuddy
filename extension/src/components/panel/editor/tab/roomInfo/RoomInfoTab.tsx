import { baseButtonClassName } from "@cb/components/dialog/RoomDialog";
import { SelectProblemDialog } from "@cb/components/dialog/SelectProblemDialog";
import { MAX_CAPACITY } from "@cb/context/RTCProvider";
import { getRoomRef, getSessionRef } from "@cb/db";
import {
  useAppState,
  useFirebaseListener,
  useOnMount,
  useRTC,
} from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import { getQuestionIdFromUrl } from "@cb/utils";
import { cn } from "@cb/utils/cn";
import { formatTime } from "@cb/utils/heartbeat";
import { Timestamp } from "firebase/firestore";
import { Grid2X2, Timer, Users } from "lucide-react";
import React from "react";

export const RoomInfoTab = () => {
  const {
    user: { username },
  } = useAppState();
  const { roomId, peerState, handleNavigateToNextQuestion } = useRTC();
  const sessionId = React.useMemo(
    () => getQuestionIdFromUrl(window.location.href),
    []
  );
  const [chooseNextQuestion, setChooseNextQuestion] = React.useState(false);
  const [showNavigatePrompt, setShowNavigatePrompt] = React.useState(false);
  const [choosePopUp, setChoosePopup] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);
  const { data: roomDoc } = useFirebaseListener({
    reference: getRoomRef(roomId ?? undefined),
    init: { usernames: [], isPublic: true, roomName: "" },
  });
  const { data: sessionDoc } = useFirebaseListener({
    reference: roomId != null ? getSessionRef(roomId, sessionId) : undefined,
    callback: async (sessionData) => {
      const data = sessionData;
      // todo(nickbar01234): Clear and report room if deleted?
      if (data == undefined) return;
      const usernames = data.usernames;
      const nextQuestionChosen = sessionData.nextQuestion !== "";
      const finishedUsers = sessionData.finishedUsers;
      setChooseNextQuestion(
        !nextQuestionChosen && finishedUsers.includes(username)
      );
      setShowNavigatePrompt(
        nextQuestionChosen &&
          usernames.every((user) => finishedUsers.includes(user))
      );
      setElapsed(
        Date.now() - (data.createdAt?.toDate()?.getTime() ?? Date.now())
      );
    },
    init: {
      usernames: [],
      finishedUsers: [],
      nextQuestion: "",
      createdAt: Timestamp.fromDate(new Date()),
    },
  });

  const unfinishedPeers = React.useMemo(
    () =>
      (sessionDoc?.usernames?.length ?? 0) -
      (sessionDoc?.finishedUsers?.length ?? 0),
    [sessionDoc]
  );
  //we need this to prevent other user from choosing the question if there is already someone choose it
  React.useEffect(() => {
    if (!chooseNextQuestion) {
      setChoosePopup(false);
    }
  }, [chooseNextQuestion]);

  useOnMount(() => {
    const interval = setInterval(() => {
      setElapsed((prevElapsed) => Date.now() - prevElapsed);
    }, 1000);

    return () => clearInterval(interval);
  });

  return (
    <div className="h-full w-full flex flex-col gap-4 items-center justify-start p-2 pb-">
      <h1 className="text-center text-lg font-semibold">
        {roomDoc?.roomName ?? "Room Name"}
      </h1>
      <div className="flex w-full justify-center gap-4 items-center">
        <div className="flex items-center">
          <Users className="mr-1" />
          <span className="text-sm font-medium text-tertiary">
            {Object.keys(peerState).length + 1}/{MAX_CAPACITY}
          </span>
        </div>
        <div className="flex items-center">
          <Timer className="mr-1" />
          <span className="text-sm font-medium text-tertiary">
            {formatTime(elapsed)}
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-2 w-full">
        <div className="rounded-lg border-solid border-4 p-2 shadow-sm w-full">
          <div className="text-tertiary text-sm mb-1">
            {showNavigatePrompt ? "Next" : "Current"} Problem
          </div>
          <h2 className="text-xl font-bold mb-3">
            {sessionDoc?.nextQuestion != ""
              ? sessionDoc?.nextQuestion
              : getQuestionIdFromUrl(window.location.href)}
            <span className="text-orange-400 ml-2">[Medium]</span>
          </h2>
          <div className="flex gap-2 mb-4">
            <span className="bg-[--color-tabset-tabbar-background] text-tertiary px-4 py-1 rounded-full text-sm">
              Hash Table
            </span>
            <span className="bg-[--color-tabset-tabbar-background] text-tertiary px-4 py-1 rounded-full text-sm">
              String
            </span>
            <span className="bg-[--color-tabset-tabbar-background] text-tertiary px-4 py-1 rounded-full text-sm">
              Sliding Window
            </span>
          </div>
        </div>
        <div className="w-full text-lg text-tertiary text-left">
          Waiting for {unfinishedPeers} members to finish...
        </div>
      </div>
      <SelectProblemDialog
        trigger={{
          customTrigger: true,
          node: (
            <div
              className={cn("relative inline-block", {
                hidden: !chooseNextQuestion,
              })}
            >
              <Button className="bg-[#DD5471] hover:bg-[#DD5471]/80 text-white rounded-md flex items-center gap-2 px-4 py-2 font-medium">
                <Grid2X2 className="h-5 w-5 text-white" />
                Select next problem
              </Button>
              <div className="absolute -top-[0.3rem] -right-[0.3rem] w-3 h-3 bg-[#FF3B30] rounded-full border-[4px] border-background" />
            </div>
          ),
        }}
        open={choosePopUp}
        setOpen={setChoosePopup}
      />
      {showNavigatePrompt && (
        <div className="flex w-full flex-col">
          <h1 className="mb-4 text-center text-lg font-semibold">
            Do you want to go on to next question?
          </h1>
          <div className="flex justify-center gap-4">
            <Button
              onClick={handleNavigateToNextQuestion}
              className={baseButtonClassName}
            >
              Yes
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
