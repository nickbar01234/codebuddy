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

const _RoomControlMenu = ({
  appState,
  onCreateRoom,
  onJoinRoom,
  onLeaveRoom,
  groupId,
  setInputRoomId,
}: {
  appState: AppState;
  onCreateRoom: (e: Event) => void;
  onJoinRoom: (e: React.MouseEvent | React.KeyboardEvent) => void;
  onLeaveRoom: (e: Event) => void;
  groupId: string;
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
              navigator.clipboard.writeText(groupId ?? "");
            }}
          >
            <span className="flex items-center gap-2">
              <CopyIcon /> Copy Room ID
            </span>
          </RoomControlDropdownMenuItem>
          <RoomControlDropdownMenuItem onSelect={onLeaveRoom}>
            <span className="flex items-center gap-2">
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
  const { createRoom, joinRoom, groupId, leaveRoom } = useRTC();
  const { state: appState, setState: setAppState } =
    React.useContext(appStateContext);
  const [inputRoomId, setInputRoomId] = React.useState("");

  React.useEffect(() => {
    if (groupId != null) {
      setAppState(AppState.ROOM);
    } else {
      setAppState(AppState.HOME);
    }
  }, [groupId, setAppState]);

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
      leaveRoom(groupId).then(() => signOut(auth));
    }, 1000);
  }, [leaveRoom, groupId]);

  const resetExtensionThrottled = React.useMemo(() => {
    return throttle((event: Event) => {
      event.stopPropagation?.();
      clearLocalStorage();
    }, 1000);
  }, []);

  const leaveRoomThrottled = React.useMemo(() => {
    return throttle((event: Event) => {
      event.stopPropagation?.();
      setAppState(AppState.HOME);
      if (groupId) {
        leaveRoom(groupId);
      }
    }, 1000);
  }, [groupId, leaveRoom, setAppState]);

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
          groupId={groupId ?? inputRoomId}
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
