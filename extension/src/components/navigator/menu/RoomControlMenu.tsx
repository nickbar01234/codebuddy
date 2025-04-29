import { LeaveRoomDialog } from "@cb/components/dialog/LeaveRoomDialog";
import { CopyIcon, LeaveIcon, SignOutIcon } from "@cb/components/icons";
import { AppState, appStateContext } from "@cb/context/AppStateProvider";
import { auth } from "@cb/db";
import { useRTC } from "@cb/hooks/index";
import { signOut } from "firebase/auth/web-extension";
import { throttle } from "lodash";
import React from "react";
import { _AppControlMenu } from "./AppControlMenu";
import { Menu } from "./Menu";
import { RoomControlDropdownMenuItem } from "./RoomControlDropdownMenuItem";

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

  return (
    <Menu>
      {appState === AppState.ROOM && (
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
              triggerProps={{
                node: (
                  <span className="flex items-center gap-2">
                    <LeaveIcon /> Leave Room
                  </span>
                ),
                customTrigger: true,
              }}
            />
          </RoomControlDropdownMenuItem>
        </>
      )}
      <RoomControlDropdownMenuItem onSelect={signOutThrottled}>
        <span className="flex items-center gap-2">
          <SignOutIcon /> <span>Sign Out</span>
        </span>
      </RoomControlDropdownMenuItem>
      <_AppControlMenu />
    </Menu>
  );
};
