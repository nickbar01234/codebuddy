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
  DropdownMenuItem,
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

const _RoomControlMenu = () => {
  const { createRoom, joinRoom, roomId, leaveRoom } = useRTC();
  const { state: appState, setState: setAppState } =
    React.useContext(appStateContext);
  const [inputRoomId, setInputRoomId] = React.useState("");

  const onJoinRoom = async (
    e: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element>
  ) => {
    e.stopPropagation();
    const haveJoined = await joinRoom(inputRoomId);
    if (haveJoined) {
      setAppState(AppState.ROOM);
    }
  };

  const onChangeRoomIdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setInputRoomId(e.target.value);
  };

  switch (appState) {
    case AppState.HOME:
      return (
        <>
          <DropdownMenuItem
            className="focus:bg-[--color-tab-hover-background] hover:bg-[--color-tab-hover-background] cursor-pointer"
            onSelect={(e) => {
              e.stopPropagation();
              setAppState(AppState.ROOM);
              createRoom({});
            }}
          >
            <span className="flex gap-2 items-center">
              <PlusIcon /> Create Room
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="relative focus:bg-[--color-tab-hover-background] hover:bg-[--color-tab-hover-background] cursor-pointer"
            onSelect={(e) => e.preventDefault()}
          >
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
                      e.stopPropagation();
                      onJoinRoom(e as React.KeyboardEvent<Element>);
                    } // Trigger the join room action
                  }}
                />
              </DialogContent>
            </Dialog>
          </DropdownMenuItem>
        </>
      );

    case AppState.ROOM:
      return (
        <>
          <DropdownMenuItem
            className="focus:bg-[--color-tab-hover-background] hover:bg-[--color-tab-hover-background] cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(roomId ?? "");
            }}
          >
            <span className="flex gap-2 items-center">
              <CopyIcon /> Copy Room ID
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="focus:bg-[--color-tab-hover-background] hover:bg-[--color-tab-hover-background] cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setAppState(AppState.HOME);
              if (roomId) leaveRoom(roomId);
            }}
          >
            <span className="flex gap-2 items-center">
              <LeaveIcon /> Leave Room
            </span>
          </DropdownMenuItem>
        </>
      );

    default:
      return <></>;
  }
};

export const RoomControlMenu = () => {
  const { roomId, leaveRoom } = useRTC();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MenuIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="absolute right-0 top-2 shadow-level3 dark:shadow-dark-level3 rounded-lg border border-border-tertiary dark:border-border-tertiary bg-layer-02 dark:bg-layer-02 w-max flex flex-col">
        <_RoomControlMenu />
        <DropdownMenuItem
          className="focus:bg-[--color-tab-hover-background] hover:bg-[--color-tab-hover-background] cursor-pointer"
          onSelect={() => leaveRoom(roomId).then(() => signOut(auth))}
        >
          <span className="flex gap-2">
            <SignOutIcon /> <span>Sign Out</span>
          </span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="focus:bg-[--color-tab-hover-background] hover:bg-[--color-tab-hover-background] cursor-pointer"
          onSelect={(e) => {
            clearLocalStorage();
            e.stopPropagation();
          }}
        >
          <span className="flex gap-2">
            <ResetIcon /> <span>Reset Extension</span>
          </span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
