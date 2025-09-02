import { baseButtonClassName } from "@cb/components/dialog/RoomDialog";
import { CopyIcon, LeaveIcon, SignOutIcon } from "@cb/components/icons";
import { useSignOut } from "@cb/hooks/auth";
import { Button } from "@cb/lib/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cb/lib/components/ui/dialog";
import { RoomStatus, useRoom } from "@cb/store";
import { throttle } from "lodash";
import React from "react";
import { _AppControlMenu } from "./AppControlMenu";
import { DropdownMenuItem } from "./DropdownMenuItem";
import { Menu } from "./Menu";

export const RoomControlMenu = () => {
  const roomStatus = useRoom((state) => state.status);
  const signout = useSignOut();
  const copyRoomId = useCopyRoomId();

  const leave = useRoom((state) => state.actions.room.leave);

  const leaveRoomThrottled = React.useMemo(() => {
    return throttle((event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation?.();
      leave();
    }, 1000);
  }, [leave]);

  return (
    <Dialog>
      <Menu>
        {roomStatus === RoomStatus.IN_ROOM && (
          <>
            <DropdownMenuItem onSelect={() => copyRoomId()}>
              <span className="flex items-center gap-2">
                <CopyIcon /> Copy Room ID
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <DialogTrigger>
                <span className="flex items-center gap-2">
                  <LeaveIcon /> Leave Room
                </span>
              </DialogTrigger>
            </DropdownMenuItem>
          </>
        )}
        <DropdownMenuItem onSelect={signout}>
          <span className="flex items-center gap-2">
            <SignOutIcon /> <span>Sign Out</span>
          </span>
        </DropdownMenuItem>
        <_AppControlMenu />
      </Menu>

      <DialogContent className={cn("bg-primary")}>
        <DialogHeader>
          <DialogTitle className={cn("text-left text-xl font-semibold")}>
            {"Leave Room"}
          </DialogTitle>
          <DialogDescription className={cn("text-left text-base font-medium")}>
            {
              "You will be disconnected, and you may not be able to rejoin unless invited again."
            }
          </DialogDescription>
        </DialogHeader>
        <div className="flex w-full items-center justify-end gap-2 self-end">
          <DialogClose asChild>
            <Button
              className={baseButtonClassName}
              onClick={leaveRoomThrottled}
            >
              <span className="text-sm font-medium">Yes</span>
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button className={baseButtonClassName}>
              <span className="text-sm font-medium">No</span>
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};
