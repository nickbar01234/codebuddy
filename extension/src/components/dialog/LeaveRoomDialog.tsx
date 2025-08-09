import { useRTC } from "@cb/hooks/index";
import { useInRoom } from "@cb/hooks/store";
import { Button } from "@cb/lib/components/ui/button";
import { DialogClose } from "@cb/lib/components/ui/dialog";
import { throttle } from "lodash";
import React from "react";
import { RoomDialog, RoomDialogProps, baseButtonClassName } from "./RoomDialog";

type LeaveRoomDialogProps = Partial<RoomDialogProps["trigger"]>;

export function LeaveRoomDialog(props: LeaveRoomDialogProps) {
  const { leaveRoom } = useRTC();
  const { id: roomId } = useInRoom();

  const leaveRoomThrottled = React.useMemo(() => {
    return throttle((event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation?.();
      if (roomId) {
        leaveRoom(roomId);
      }
    }, 1000);
  }, [roomId, leaveRoom]);

  return (
    <RoomDialog
      title={{ node: "Are you sure that you want to leave the room?" }}
      description={{
        node: "You will be disconnected, and you may not be able to rejoin unless invited again.",
      }}
      trigger={{
        label: "Leave Room",
        node: "Leave Room",
        ...(props ?? {}),
      }}
    >
      <div className="flex w-full items-center justify-end gap-2 self-end">
        <DialogClose asChild>
          <Button className={baseButtonClassName} onClick={leaveRoomThrottled}>
            <span className="text-sm font-medium">Yes</span>
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button className={baseButtonClassName}>
            <span className="text-sm font-medium">No</span>
          </Button>
        </DialogClose>
      </div>
    </RoomDialog>
  );
}
