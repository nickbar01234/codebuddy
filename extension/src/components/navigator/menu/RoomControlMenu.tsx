import { LeaveRoomDialog } from "@cb/components/dialog/LeaveRoomDialog";
import { CopyIcon, LeaveIcon, SignOutIcon } from "@cb/components/icons";
import { auth } from "@cb/db";
import { useRTC } from "@cb/hooks/index";
import { RoomStatus, roomStore } from "@cb/store";
import { signOut } from "firebase/auth/web-extension";
import { throttle } from "lodash";
import React from "react";
import { useStore } from "zustand";
import { _AppControlMenu } from "./AppControlMenu";
import { DropdownMenuItem } from "./DropdownMenuItem";
import { Menu } from "./Menu";

export const RoomControlMenu = () => {
  const { roomId, leaveRoom } = useRTC();
  const roomStatus = useStore(roomStore, (state) => state.room.status);

  const signOutThrottled = React.useMemo(() => {
    return throttle(() => {
      leaveRoom(roomId).then(() => signOut(auth));
    }, 1000);
  }, [leaveRoom, roomId]);

  return (
    <Menu>
      {roomStatus === RoomStatus.IN_ROOM && (
        <>
          <DropdownMenuItem
            onSelect={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(roomId ?? "");
            }}
          >
            <span className="flex items-center gap-2">
              <CopyIcon /> Copy Room ID
            </span>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
            <LeaveRoomDialog
              customTrigger
              node={
                <span className="flex items-center gap-2">
                  <LeaveIcon /> Leave Room
                </span>
              }
            />
          </DropdownMenuItem>
        </>
      )}
      <DropdownMenuItem onSelect={signOutThrottled}>
        <span className="flex items-center gap-2">
          <SignOutIcon /> <span>Sign Out</span>
        </span>
      </DropdownMenuItem>
      <_AppControlMenu />
    </Menu>
  );
};
