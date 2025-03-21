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
  DialogClose,
} from "@cb/lib/components/ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { RoomControlDropdownMenuItem } from "./RoomControlDropdownMenuItem";
import { throttle } from "lodash";

const _RoomControlMenu = ({
  appState,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  roomId,
  setInputRoomId,
}: {
  appState: AppState;
  onCreateRoom: (e: Event) => void;
  onJoinRoom: (e: React.MouseEvent | React.KeyboardEvent) => void;
  onLeaveRoom: (e: React.MouseEvent<HTMLButtonElement>) => void;
  roomId: string;
  setInputRoomId: React.Dispatch<React.SetStateAction<string>>;
}) => {
  const onChangeRoomIdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setInputRoomId(e.target.value);
  };

  switch (appState) {
    case AppState.HOME:
      return (
        <>
          <RoomControlDropdownMenuItem onSelect={onCreateRoom}>
            <span className="flex items-center gap-2">
              <PlusIcon /> Create Room
            </span>
          </RoomControlDropdownMenuItem>
          <RoomControlDropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Dialog>
              <DialogTrigger>
                <span className="flex items-center gap-2">
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
                  className="bg-fill-3 dark:bg-dark-fill-3 w-full cursor-text rounded-lg border border-transparent px-3 py-[5px]"
                  placeholder="Enter room ID"
                  onChange={onChangeRoomIdInput}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      onJoinRoom(e);
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
            <span className="flex items-center gap-2">
              <CopyIcon /> Copy Room ID
            </span>
          </RoomControlDropdownMenuItem>
          <RoomControlDropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <Dialog>
              <DialogTrigger>
                <span className="flex items-center gap-2">
                  <LeaveIcon /> Leave Room
                </span>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-left text-xl">
                    Are you sure that you want to leave the room?
                  </DialogTitle>
                  <DialogDescription className="text-left font-medium">
                    You will be disconnected, and you may not be able to rejoin
                    unless invited again.
                  </DialogDescription>
                  <div className="mt-4 flex w-full items-center justify-end gap-2 self-end">
                    <DialogClose asChild>
                      <button
                        className="h-10 rounded-md px-4 py-2 hover:bg-slate-300"
                        onClick={onLeaveRoom}
                      >
                        <span className="text-sm font-medium">Yes</span>
                      </button>
                    </DialogClose>

                    <DialogClose asChild>
                      <button className="h-10 rounded-md px-4 py-2 hover:bg-slate-300">
                        <span className="text-sm font-medium">No</span>
                      </button>
                    </DialogClose>
                  </div>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          </RoomControlDropdownMenuItem>
        </>
      );

    default:
      return <></>;
  }
};

export const RoomControlMenu = () => {
  const { createRoom, joinRoom, roomId, leaveRoom } = useRTC();
  const { state: appState, setState: setAppState } =
    React.useContext(appStateContext);
  const [inputRoomId, setInputRoomId] = React.useState("");

  React.useEffect(() => {
    if (roomId != null) {
      setAppState(AppState.ROOM);
    } else {
      setAppState(AppState.HOME);
    }
  }, [roomId, setAppState]);

  const createRoomThrottled = React.useMemo(() => {
    return throttle((event: Event) => {
      event.stopPropagation?.();
      setAppState(AppState.ROOM);
      createRoom({});
    }, 1000);
  }, [createRoom, setAppState]);

  const joinRoomThrottled = React.useMemo(() => {
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

  const signOutThrottled = React.useMemo(() => {
    return throttle(() => {
      leaveRoom(roomId).then(() => signOut(auth));
    }, 1000);
  }, [leaveRoom, roomId]);

  const resetExtensionThrottled = React.useMemo(() => {
    return throttle((event: Event) => {
      event.stopPropagation?.();
      clearLocalStorage();
    }, 1000);
  }, []);

  const leaveRoomThrottled = React.useMemo(() => {
    return throttle((event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation?.();
      if (roomId) {
        leaveRoom(roomId);
      }
      setAppState(AppState.HOME);
    }, 1000);
  }, [roomId, leaveRoom, setAppState]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MenuIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="shadow-level3 dark:shadow-dark-level3 border-border-tertiary dark:border-border-tertiary bg-layer-02 dark:bg-layer-02 absolute right-0 top-2 flex w-max flex-col rounded-lg border">
        <_RoomControlMenu
          appState={appState}
          onCreateRoom={createRoomThrottled}
          onJoinRoom={joinRoomThrottled}
          onLeaveRoom={leaveRoomThrottled}
          roomId={roomId ?? inputRoomId}
          setInputRoomId={setInputRoomId}
        />
        <RoomControlDropdownMenuItem onSelect={signOutThrottled}>
          <span className="flex items-center gap-2">
            <SignOutIcon /> <span>Sign Out</span>
          </span>
        </RoomControlDropdownMenuItem>
        <RoomControlDropdownMenuItem onSelect={resetExtensionThrottled}>
          <span className="flex items-center gap-2">
            <ResetIcon /> <span>Reset Extension</span>
          </span>
        </RoomControlDropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
