import { AppState } from "@cb/context/AppStateProvider";
import { useAppState, useRTC } from "@cb/hooks/index";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cb/lib/components/ui/dialog";
import { throttle } from "lodash";
import React, { ReactNode } from "react";

export interface DialogProps {
  trigger: ReactNode;
}

export function LeaveRoomDialog({ trigger }: DialogProps) {
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
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-left text-xl">
            Are you sure that you want to leave the room?
          </DialogTitle>
          <DialogDescription className="text-left font-medium">
            You will be disconnected, and you may not be able to rejoin unless
            invited again.
          </DialogDescription>
          <div className="mt-4 flex w-full items-center justify-end gap-2 self-end">
            <DialogClose asChild>
              <button
                className="hover:bg-fill-secondary h-10 rounded-md px-4 py-2"
                onClick={leaveRoomThrottled}
              >
                <span className="text-sm font-medium">Yes</span>
              </button>
            </DialogClose>
            <DialogClose asChild>
              <button className="h-10 rounded-md px-4 py-2 hover:bg-[--color-tab-hover-background]">
                <span className="text-sm font-medium">No</span>
              </button>
            </DialogClose>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
