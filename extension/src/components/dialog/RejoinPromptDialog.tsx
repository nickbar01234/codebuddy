import { AppState } from "@cb/context/AppStateProvider";
import { useAppState, useRTC } from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import { DialogClose } from "@cb/lib/components/ui/dialog";
import { removeLocalStorage } from "@cb/services";
import { throttle } from "lodash";
import React from "react";
import { RoomDialog, baseButtonClassName } from "./RoomDialog";

export const RejoinPromptDialog = () => {
  const { joiningBackRoom, roomId, leaveRoom } = useRTC();
  const { setState: setAppState } = useAppState();

  const leaveRoomThrottled = React.useMemo(() => {
    return throttle((event: React.MouseEvent<HTMLButtonElement>) => {
      removeLocalStorage("closingTabs");
      event.stopPropagation?.();
      setAppState(AppState.HOME);
      if (roomId) {
        leaveRoom(roomId);
      }
    }, 1000);
  }, [roomId, leaveRoom, setAppState]);

  return (
    <RoomDialog
      trigger={<></>}
      open={true}
      modal={true}
      title="Do you want to rejoin the room?"
      description="You will rejoin on the current question of the room"
    >
      <div className="mt-6 flex w-full items-center justify-end gap-2 self-end">
        <DialogClose asChild>
          <Button
            className={baseButtonClassName}
            onClick={() => {
              removeLocalStorage("closingTabs");
              joiningBackRoom();
              setAppState(AppState.LOADING);
            }}
          >
            <span className="text-sm font-medium">Yes</span>
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button className={baseButtonClassName} onClick={leaveRoomThrottled}>
            <span className="text-sm font-medium">No</span>
          </Button>
        </DialogClose>
      </div>
    </RoomDialog>
  );
};
