import { LeaveRoomDialog } from "@cb/components/dialog/LeaveRoomDialog";
import {
  CopyIcon,
  LeaveIcon,
  MenuIcon,
  ResetIcon,
  SignOutIcon,
} from "@cb/components/icons";
import { AppState, appStateContext } from "@cb/context/AppStateProvider";
import { auth } from "@cb/db";
import { useRTC } from "@cb/hooks/index";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@cb/lib/components/ui/dropdown-menu";
import { clearLocalStorage, sendServiceRequest } from "@cb/services";
import { signOut } from "firebase/auth/web-extension";
import { throttle } from "lodash";
import { Hammer } from "lucide-react";
import React from "react";
import { RoomControlDropdownMenuItem } from "./RoomControlDropdownMenuItem";

const _RoomControlMenu = ({
  appState,
  roomId,
}: {
  appState: AppState;
  roomId: string;
}) => {
  switch (appState) {
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
            <LeaveRoomDialog
              trigger={
                <span className="flex items-center gap-2">
                  <LeaveIcon /> Leave Room
                </span>
              }
            />
          </RoomControlDropdownMenuItem>
        </>
      );

    default:
      return <></>;
  }
};

export const RoomControlMenu = () => {
  const { roomId, leaveRoom } = useRTC();
  const { state: appState, setState: setAppState } =
    React.useContext(appStateContext);

  React.useEffect(() => {
    if (roomId != null) {
      setAppState(AppState.ROOM);
    } else {
      setAppState(AppState.HOME);
    }
  }, [roomId, setAppState]);

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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <MenuIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="shadow-level3 dark:shadow-dark-level3 border-border-tertiary dark:border-border-tertiary bg-layer-02 dark:bg-layer-02 absolute right-0 top-2 flex w-max flex-col rounded-lg border">
        <_RoomControlMenu appState={appState} roomId={roomId ?? ""} />
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
        {import.meta.env.MODE === "development" && (
          <RoomControlDropdownMenuItem
            onSelect={() => sendServiceRequest({ action: "reloadExtension" })}
          >
            <span className="flex items-center gap-2">
              <Hammer />
              <span>Reload extension</span>
            </span>
          </RoomControlDropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
