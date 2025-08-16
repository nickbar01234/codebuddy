import { LeaveRoomDialog } from "@cb/components/dialog/LeaveRoomDialog";
import { CopyIcon, LeaveIcon, SignOutIcon } from "@cb/components/icons";
import { auth } from "@cb/db";
import { RoomStatus, useRoom } from "@cb/store";
import { signOut } from "firebase/auth/web-extension";
import { throttle } from "lodash";
import React from "react";
import { _AppControlMenu } from "./AppControlMenu";
import { DropdownMenuItem } from "./DropdownMenuItem";
import { Menu } from "./Menu";

export const RoomControlMenu = () => {
  const roomId = useRoom((state) => state.room?.id);
  const leave = useRoom((state) => state.actions.room.leave);
  const roomStatus = useRoom((state) => state.status);

  const signOutThrottled = React.useMemo(() => {
    return throttle(() => {
      leave().then(() => signOut(auth));
    }, 1000);
  }, [leave]);

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
