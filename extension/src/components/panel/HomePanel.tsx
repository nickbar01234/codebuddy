import {
  CodeIcon,
  PlusIcon,
} from "@cb/components/icons";
import { useRTC } from "@cb/hooks/index";
import React from "react";
import { AppState, appStateContext } from "@cb/context/AppStateProvider";
import { Dialog, DialogHeader, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@cb/lib/components/ui/dialog"; 
import { throttle } from "lodash";


const HomePanel = () => {
  const darkLogo = chrome.runtime.getURL("images/logo_dark.png");
  const lightLogo = chrome.runtime.getURL("images/logo_light.png");

  const { createRoom, joinRoom } = useRTC();
  const { state: appState, setState: setAppState } = React.useContext(appStateContext);
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
    <div className="h-full w-full flex flex-col justify-center items-center overflow-auto gap-y-2">
      <div className="h-1/3 w-1/3 mb-5 justify-center items-center text-center">
        <div className="justify-center items-center text-center mb-2">
          <img src={lightLogo} className="dark:hidden" alt="CodeBuddy logo" />
          <img src={darkLogo} className="hidden dark:block" alt="CodeBuddy logo"/>
        </div>
        <h1 className="text-2xl overflow-hidden">CodeBuddy</h1>
      </div>
      
      <button
        className="flex w-1/3 items-center bg-fill-primary rounded-lg px-[12px] py-[8px] text-sm font-medium overflow-auto shadow hover:bg-fill-secondary transition"
        type="button"
        onClick={onCreateRoom}
        aria-label="Create a new room"
      >
        <PlusIcon /> 
        <div className="h-full w-full text-center">
          Create Room
        </div>
      </button>

      <Dialog>
        <DialogTrigger className="w-1/3">
          <button
            className="flex w-full items-center bg-fill-primary rounded-lg px-[12px] py-[8px] text-sm font-medium overflow-auto shadow hover:bg-fill-secondary transition"
            type="button"
            aria-label="Join an existing room"
          >
            <CodeIcon /> 
            <div className="h-full w-full text-center">
              Join Room
            </div>
          </button>
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
  )
}

export default HomePanel;
