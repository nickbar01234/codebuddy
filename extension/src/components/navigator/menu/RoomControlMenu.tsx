import {
  CodeIcon,
  CopyIcon,
  LeaveIcon,
  MenuIcon,
  PlusIcon,
  ResetIcon,
  SignOutIcon,
} from "@cb/components/icons";
import { AppState, appStateContext } from "@cb/context/AppStateProvider";
import { auth } from "@cb/db";
import { useRTC } from "@cb/hooks/index";
import { clearLocalStorage } from "@cb/services";
import { signOut } from "firebase/auth/web-extension";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@cb/lib/components/ui/dropdown-menu";
import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@cb/lib/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { RoomControlDropdownMenuItem } from "./RoomControlDropdownMenuItem";
import { throttle } from "lodash";

const _RoomControlMenu = () => {
  const { createRoom, joinRoom, roomId, leaveRoom } = useRTC();
  const { state: appState, setState: setAppState } =
    React.useContext(appStateContext);
  const [inputRoomId, setInputRoomId] = React.useState("");

  const createRoomThrottled = React.useCallback(
    throttle((e) => {
      e.stopPropagation();
      setAppState(AppState.ROOM);
      createRoom({});
    }, 1000),
    [createRoom, setAppState]
  );

  const leaveRoomThrottled = React.useCallback(
    throttle((e) => {
      e.stopPropagation();
      setAppState(AppState.HOME);
      if (roomId) leaveRoom(roomId);
    }, 1000),
    [leaveRoom, setAppState, roomId]
  );

  const onJoinRoom = async (
    e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>
  ) => {
    e.stopPropagation();
    const haveJoined = await joinRoom(inputRoomId);
    if (haveJoined) {
      setAppState(AppState.ROOM);
    }
  };
  const joinRoomThrottled = React.useCallback(
    throttle((e) => {
      e.stopPropagation();
      onJoinRoom(e as React.KeyboardEvent<Element>);
    }, 1000),
    [onJoinRoom]
  );

  const onChangeRoomIdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setInputRoomId(e.target.value);
  };

  switch (appState) {
    case AppState.HOME:
      return (
        <>
          <RoomControlDropdownMenuItem onSelect={createRoomThrottled}>
            <span className="flex gap-2 items-center">
              <PlusIcon /> Create Room
            </span>
          </RoomControlDropdownMenuItem>
          <RoomControlDropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Dialog>
              <DialogTrigger>
                <span className="flex gap-2 items-center">
                  <CodeIcon /> Join Room
                </span>
              </DialogTrigger>
              <DialogContent className="[&>button]:hidden">
                <DialogHeader className="text-2xl">
                  <DialogTitle>Input Room ID</DialogTitle>
                </DialogHeader>
                <DialogDescription className="hidden">
                  Input room ID
                </DialogDescription>
                <input
                  className="w-full cursor-text rounded-lg border px-3 py-[5px] bg-fill-3 dark:bg-dark-fill-3 border-transparent"
                  placeholder="Enter room ID"
                  onChange={onChangeRoomIdInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      joinRoomThrottled(e);
                    } // Trigger the join room action
                  }}
                />
              </DialogContent>
            </Dialog>
          </RoomControlDropdownMenuItem>
        </>
      );

    case AppState.ROOM:
      return (
        <>
          <RoomControlDropdownMenuItem
            onSelect={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(roomId ?? "");
            }}
          >
            <span className="flex gap-2 items-center">
              <CopyIcon /> Copy Room ID
            </span>
          </RoomControlDropdownMenuItem>
          <RoomControlDropdownMenuItem
            onSelect={leaveRoomThrottled}
          >
            <span className="flex gap-2 items-center">
              <LeaveIcon /> Leave Room
            </span>
          </RoomControlDropdownMenuItem>
        </>
      );

    default:
      return <></>;
  }
};

export const RoomControlMenu = () => {
  const { roomId, leaveRoom } = useRTC();
  const { setState: setAppState } = React.useContext(appStateContext);

  React.useEffect(() => {
    if (roomId != null) {
      setAppState(AppState.ROOM);
    } else {
      setAppState(AppState.HOME);
    }
  }, [roomId, setAppState]);

  const signOutThrottled = React.useCallback(
    throttle(() => leaveRoom(roomId).then(() => signOut(auth)), 1000),
    [leaveRoom, roomId]
  );

  const resetExtensionThrottled = React.useCallback(
    throttle((e) => {
      clearLocalStorage();
      e.stopPropagation();
    }, 1000),
    []
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MenuIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="absolute right-0 top-2 shadow-level3 dark:shadow-dark-level3 rounded-lg border border-border-tertiary dark:border-border-tertiary bg-layer-02 dark:bg-layer-02 w-max flex flex-col">
        <_RoomControlMenu />
        <RoomControlDropdownMenuItem
          onSelect={signOutThrottled}
        >
          <span className="flex gap-2 items-center">
            <SignOutIcon /> <span>Sign Out</span>
          </span>
        </RoomControlDropdownMenuItem>
        <RoomControlDropdownMenuItem
          onSelect={resetExtensionThrottled}
        >
          <span className="flex gap-2 items-center">
            <ResetIcon /> <span>Reset Extension</span>
          </span>
        </RoomControlDropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
