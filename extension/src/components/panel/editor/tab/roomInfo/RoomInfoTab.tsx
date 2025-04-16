import { QuestionSelectorPanel } from "@cb/components/panel/problem";
import { RenderButton } from "@cb/components/ui/RenderButton";
import { getRoom, getSession, getSessionRef } from "@cb/db";
import { Room, Session } from "@cb/db/converter";
import { useAppState, useRTC } from "@cb/hooks/index";
import useResource from "@cb/hooks/useResource";
import { Button } from "@cb/lib/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@cb/lib/components/ui/dialog";
import { getQuestionIdFromUrl } from "@cb/utils";
import { formatTime } from "@cb/utils/heartbeat";
import { onSnapshot, Unsubscribe } from "firebase/firestore";
import { Grid2X2, Timer, Users } from "lucide-react";
import React from "react";

export const RoomInfoTab = () => {
  const {
    register: registerSnapshot,
    get: getSnapshot,
    cleanup: cleanupSnapshot,
  } = useResource<Unsubscribe>({ name: "snapshot" });
  const {
    user: { username },
  } = useAppState();
  const {
    roomId,
    peerState,
    handleChooseQuestion,
    handleNavigateToNextQuestion,
  } = useRTC();
  const sessionId = React.useMemo(
    () => getQuestionIdFromUrl(window.location.href),
    []
  );
  const [chooseNextQuestion, setChooseNextQuestion] =
    React.useState<boolean>(false);
  const [showNavigatePrompt, setShowNavigatePrompt] =
    React.useState<boolean>(false);
  const [roomDoc, setRoomDoc] = React.useState<Room | null>(null);
  const [sessionDoc, setSessionDoc] = React.useState<Session | null>(null);
  const [elapsed, setElapsed] = React.useState<number>(
    Date.now() - (sessionDoc?.createdAt?.toDate()?.getTime() ?? 0)
  );
  const [open, setOpen] = React.useState(false);
  const unfinishedPeers = React.useMemo(
    () =>
      Object.entries(peerState)
        .filter(([_, state]) => !state.finished)
        .map(([peerId, state]) => ({ peerId, ...state })),
    [peerState]
  );

  React.useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(
        Date.now() - (sessionDoc?.createdAt?.toDate()?.getTime() ?? Date.now())
      );
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionDoc]);

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
          setSessionDoc(data);

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
              setChooseNextQuestion(true);
            }
          } else {
            setChooseNextQuestion(false);
            if (usernames.every((user) => finishedUsers.includes(user))) {
              setShowNavigatePrompt(true);
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
    <div className="h-full w-full flex flex-col gap-4 items-center justify-start p-2 pb-">
      <h1 className="text-center text-lg font-semibold">
        {roomDoc?.roomName ?? "Room Name"}
      </h1>
      <div className="flex w-full justify-center gap-4 items-center">
        <div className="flex items-center">
          <Users className="mr-1" />
          <span className="text-sm font-medium text-tertiary">
            {Object.keys(peerState).length + 1}/4
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
          Waiting for {unfinishedPeers.length} members to finish...
        </div>
      </div>

      {chooseNextQuestion && (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <div className="relative inline-block">
              <Button className="bg-[#DD5471] hover:bg-[#DD5471]/80 text-white rounded-md flex items-center gap-2 px-4 py-2 font-medium">
                <Grid2X2 className="h-5 w-5 text-white" />
                Select next problem
              </Button>
              <div className="absolute -top-[0.3rem] -right-[0.3rem] w-3 h-3 bg-[#FF3B30] rounded-full border-[4px] border-background" />
            </div>
          </DialogTrigger>
          <DialogContent className="h-[80%] w-full min-w-[75%]">
            <QuestionSelectorPanel
              handleQuestionSelect={(question) => {
                handleChooseQuestion(question);
                setOpen(false); // Close the dialog
              }}
            />
          </DialogContent>
        </Dialog>
      )}

      {showNavigatePrompt && (
        <div className="flex w-full flex-col">
          <h1 className="mb-4 text-center text-lg font-semibold">
            Do you want to go on to next question?
          </h1>
          <div className="flex justify-center gap-4">
            <RenderButton
              label="YES"
              isYes={true}
              onClick={handleNavigateToNextQuestion}
            />
          </div>
        </div>
      )}
    </div>
  );
};
