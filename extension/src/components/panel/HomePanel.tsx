import { CodeIcon, PlusIcon } from "@cb/components/icons";
import { ThemeAwaredLogo } from "@cb/components/icons/Logo";
import { AppState, appStateContext } from "@cb/context/AppStateProvider";
import { useRTC } from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cb/lib/components/ui/dialog";
import { throttle } from "lodash";
import React from "react";

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
    <div className="hide-scrollbar flex h-full w-full flex-col gap-10 overflow-scroll justify-center">
      <div className="flex w-full flex-col items-center justify-end gap-2">
        <ThemeAwaredLogo
          containerProps={{
            className:
              "aspect-square max-h-[150px] min-h-[100px] w-1/3 min-w-[100px] max-w-[150px]",
          }}
        />
        <h1 className="text-2xl">
          Code<span className="text-pinkish-red">Buddy</span>
        </h1>
      </div>

      <div className="flex w-full flex-col items-center gap-3">
        <Button
          className="flex items-center justify-center w-[150px] bg-gray-200 hover:bg-[--color-tab-hover-background] dark:bg-transparent dark:hover:bg-[--color-tab-hover-background]"
          variant="secondary"
          aria-label="Create a new room"
          onClick={onCreateRoom}
        >
          <PlusIcon />
          <span>Create Room</span>
        </Button>

        <Dialog>
          <DialogTrigger>
            <Button
              className="flex items-center justify-center w-[150px] bg-gray-200 hover:bg-[--color-tab-hover-background] dark:bg-transparent dark:hover:bg-[--color-tab-hover-background]"
              variant="secondary"
              aria-label="Create a new room"
            >
              <CodeIcon />
              <span>Join Room</span>
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
