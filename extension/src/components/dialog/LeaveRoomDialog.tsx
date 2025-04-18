import { AppState } from "@cb/context/AppStateProvider";
import { useAppState, useRTC } from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import { DialogClose } from "@cb/lib/components/ui/dialog";
import { throttle } from "lodash";
import React, { ReactNode } from "react";
import { RoomDialog, baseButtonClassName } from "./RoomDialog";

interface LeaveRoomDialogProps {
  trigger: ReactNode;
}

export function LeaveRoomDialog({ trigger }: LeaveRoomDialogProps) {
  const { roomId, leaveRoom } = useRTC();
  const { setState: setAppState } = useAppState();

  const leaveRoomThrottled = React.useMemo(() => {
    return throttle((event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation?.();
      setAppState(AppState.HOME);
      if (roomId) {
        leaveRoom(roomId);
      }
    }, 1000);
  }, [roomId, leaveRoom, setAppState]);

  return (
    <RoomDialog
      // trigger={trigger}
      title={{ node: "Are you sure that you want to leave the room?" }}
      // description="You will be disconnected, and you may not be able to rejoin unless invited again."
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
