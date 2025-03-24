import {
  CodeIcon,
  PlusIcon,
} from "@cb/components/icons";
import { useRTC } from "@cb/hooks/index";
import React from "react";
import { AppState, appStateContext } from "@cb/context/AppStateProvider";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger, DialogOverlay, DialogPortal } from "@radix-ui/react-dialog";
import { DialogHeader } from "@cb/lib/components/ui/dialog";
import { RoomControlDropdownMenuItem } from "../navigator/menu/RoomControlDropdownMenuItem";
import { throttle } from "lodash";
import { MouseEvent } from 'react';



const HomePanel = () => {
  const darkLogo = chrome.runtime.getURL("images/logo_dark.png");
  const lightLogo = chrome.runtime.getURL("images/logo_light.png");

  const { createRoom, joinRoom } = useRTC();
  const { state: appState, setState: setAppState } = React.useContext(appStateContext);
  const [inputRoomId, setInputRoomId] = React.useState("");

  const onCreateRoom = React.useMemo(() => {
    return throttle((event: Event) => {
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
    <div className="h-full w-full flex flex-col justify-center items-center overflow-auto gap-y-2">
      <div className="h-1/3 w-1/3 max-h-40 max-w-40 mb-7">
        <img src={lightLogo} className="dark:hidden" alt="CodeBuddy logo" />
        <img src={darkLogo} className="hidden dark:block" alt="CodeBuddy logo"/>
      </div>
      
      <button
        className="flex w-1/3 items-center bg-fill-secondary rounded-lg px-[12px] py-[8px] text-sm font-medium"
        type="button"
        // onClick={onCreateRoom}
      >
        <PlusIcon /> 
        <div className="h-full w-full text-center">
          Create Room
        </div>
      </button>

      <button
        className="flex w-1/3 items-center bg-fill-secondary rounded-lg px-[12px] py-[8px] text-sm font-medium"
        type="button"
        onClick={() => {}}
      >
        <CodeIcon /> 
        <div className="h-full w-full text-center">
          Join Room
        </div>
      </button>

      <Dialog>
        <DialogTrigger>
          <span className="flex items-center gap-2">
            <CodeIcon /> Join Room
          </span>
        </DialogTrigger>
        <DialogOverlay/>
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
  )
}

export default HomePanel;
