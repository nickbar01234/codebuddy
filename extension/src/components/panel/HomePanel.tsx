import { CodeIcon, PlusIcon } from "@cb/components/icons";
import { useRTC } from "@cb/hooks/index";
import React from "react";
import { AppState, appStateContext } from "@cb/context/AppStateProvider";
import {
  Dialog,
  DialogHeader,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@cb/lib/components/ui/dialog";
import { throttle } from "lodash";
import { darkLogo, lightLogo } from "../icons/Logo";
import { Button } from "../../lib/components/ui/button";

const HomePanel = () => {
  const { createRoom, joinRoom } = useRTC();
  const { setState: setAppState } = React.useContext(appStateContext);
  const [inputRoomId, setInputRoomId] = React.useState("");

  const onCreateRoom = React.useMemo(() => {
    return throttle((event: Event | React.MouseEvent<Element>) => {
      event.stopPropagation?.();
      setAppState(AppState.ROOM);
      createRoom({});
    }, 1000);
  }, [createRoom, setAppState]);

  const onJoinRoom = React.useMemo(() => {
    return throttle(
      async (
        reactEvent: React.MouseEvent<Element> | React.KeyboardEvent<Element>
      ) => {
        reactEvent.stopPropagation();
        const haveJoined = await joinRoom(inputRoomId);
        if (haveJoined) {
          setAppState(AppState.ROOM);
        }
      },
      1000
    );
  }, [joinRoom, inputRoomId, setAppState]);

  const onChangeRoomIdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setInputRoomId(e.target.value);
  };

  return (
    <div className="hide-scrollbar flex h-full w-full flex-col gap-10 overflow-scroll">
      <div className="flex h-1/2 w-full flex-col items-center justify-end gap-2">
        <img
          src={lightLogo}
          className="aspect-square max-h-[150px] min-h-[100px] w-1/3 min-w-[100px] max-w-[150px] dark:hidden"
          alt="CodeBuddy logo"
        />
        <img
          src={darkLogo}
          className="hidden aspect-square max-h-[150px] min-h-[100px] w-1/3 min-w-[100px] max-w-[150px] dark:block"
          alt="CodeBuddy logo"
        />
        <h1 className="text-2xl">
          Code<span className="text-pinkish-red">Buddy</span>
        </h1>
      </div>

      <div className="flex h-1/2 w-full flex-col items-center gap-2">
        <Button
          className="bg-fill-primary w-[150px] items-center justify-center"
          variant="secondary"
          type="button"
          onClick={onCreateRoom}
          aria-label="Create a new room"
        >
          <PlusIcon />
          <div className="h-full w-full text-center">Create Room</div>
        </Button>

        <Dialog>
          <DialogTrigger>
            <Button
              className="bg-fill-primary w-[150px] items-center justify-center"
              variant="secondary"
              type="button"
              aria-label="Create a new room"
            >
              <CodeIcon />
              <div className="h-full w-full text-center">Join Room</div>
            </Button>
          </DialogTrigger>
          <DialogContent className="[&>button]:hidden">
            <DialogHeader className="text-2xl">
              <DialogTitle>Input Room ID</DialogTitle>
            </DialogHeader>
            <DialogDescription className="hidden">
              Input room ID
            </DialogDescription>
            <input
              className="bg-fill-3 dark:bg-dark-fill-3 w-full cursor-text rounded-lg border border-transparent px-3 py-[5px]"
              placeholder="Enter room ID"
              onChange={onChangeRoomIdInput}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onJoinRoom(e);
                }
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default HomePanel;
