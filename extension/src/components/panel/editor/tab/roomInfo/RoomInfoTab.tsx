import { PromptNavigateDialog } from "@cb/components/dialog/PromptNavigateDialog";
import { baseButtonClassName } from "@cb/components/dialog/RoomDialog";
import { SelectProblemDialog } from "@cb/components/dialog/SelectProblemDialog";
import { ROOM } from "@cb/constants";
import { Session } from "@cb/db/converter";
import { useAuthUser } from "@cb/hooks/store";
import { Button } from "@cb/lib/components/ui/button";
import { useRoom } from "@cb/store";
import { Room } from "@cb/types";
import { getSessionId } from "@cb/utils";
import { cn } from "@cb/utils/cn";
import { formatTime } from "@cb/utils/heartbeat";
import { Timestamp } from "firebase/firestore";
import { Grid2X2, Timer, Users } from "lucide-react";
import React from "react";

const roomDoc: Room = { usernames: [], isPublic: true, name: "", version: 0 };
const sessionDoc: Session = {
  usernames: [],
  finishedUsers: [],
  nextQuestion: "",
  createdAt: Timestamp.fromDate(new Date()),
};

// todo(nickbar01234): This component is not code-ready. We will need to re-evaluate and re-write
export const RoomInfoTab = () => {
  const { username } = useAuthUser();
  // const { roomId, handleNavigateToNextQuestion } = useRTC();
  const roomId = useRoom((state) => state.room?.id);
  const peers = useRoom((state) => state.peers);
  const [chooseNextQuestion, setChooseNextQuestion] = React.useState(false);
  const [showNavigatePrompt, setShowNavigatePrompt] = React.useState(false);
  const [choosePopUp, setChoosePopup] = React.useState(false);
  const [elapsed, setElapsed] = React.useState(0);

  const unfinishedPeers = React.useMemo(
    () =>
      roomDoc.usernames.filter(
        (username) => !sessionDoc.finishedUsers.includes(username)
      ).length,
    []
  );

  React.useEffect(() => {
    const usernames = sessionDoc.usernames;
    const nextQuestionChosen = sessionDoc.nextQuestion !== "";
    const finishedUsers = sessionDoc.finishedUsers;
    setChooseNextQuestion(
      !nextQuestionChosen && finishedUsers.includes(username)
    );
    setShowNavigatePrompt(
      nextQuestionChosen &&
        usernames.every((user) => finishedUsers.includes(user))
    );
  }, [username]);

  //we need this to prevent other user from choosing the question if there is already someone choose it
  React.useEffect(() => {
    if (!chooseNextQuestion) {
      setChoosePopup(false);
    }
  }, [chooseNextQuestion]);

  React.useEffect(() => {
    // todo(nickbar01234): Should be reading the entire room doc?
    const interval = setInterval(() => {
      setElapsed(() => Date.now() - sessionDoc.createdAt.toDate().getTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full w-full flex flex-col gap-4 items-center justify-start p-2 pb-">
      <h1 className="text-center text-lg font-semibold">
        {roomDoc?.name ?? "Room Name"}
      </h1>
      <div className="flex w-full justify-center gap-4 items-center">
        <div className="flex items-center">
          <Users className="mr-1" />
          <span className="text-sm font-medium text-tertiary">
            {Object.keys(peers).length + 1}/{ROOM.CAPACITY}
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
              : getSessionId()}
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
              // onClick={handleNavigateToNextQuestion}
              className={baseButtonClassName}
            >
              Yes
            </Button>
          </div>
        </div>
      )}
      <PromptNavigateDialog
        finished={
          roomId != null && showNavigatePrompt && sessionDoc.nextQuestion !== ""
        }
      />
    </div>
  );
};
