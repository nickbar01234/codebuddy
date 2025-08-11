import { Button } from "@cb/lib/components/ui/button";
import { DialogClose } from "@cb/lib/components/ui/dialog";
import { removeLocalStorage } from "@cb/services";
import { roomStore } from "@cb/store";
import { throttle } from "lodash";
import React from "react";
import { useStore } from "zustand";
import { RoomDialog, baseButtonClassName } from "./RoomDialog";

export const RejoinPromptDialog = () => {
  // const { joiningBackRoom, leaveRoom } = useRTC();
  const loadingRoom = useStore(roomStore, (state) => state.actions.loadingRoom);
  const leaveRoom = useStore(roomStore, (state) => state.actions.leaveRoom);

  const leaveRoomThrottled = React.useMemo(() => {
    return throttle((event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation?.();
      removeLocalStorage("closingTabs");
      leaveRoom();
    }, 1000);
  }, [leaveRoom]);

  return (
    <RoomDialog
      title={{ node: "Do you want to rejoin the room?" }}
      description={{
        node: "You will rejoin on the current question of the room",
      }}
      dialog={{
        props: {
          open: true,
          modal: true,
        },
      }}
    >
      <div className="mt-6 flex w-full items-center justify-end gap-2 self-end">
        <DialogClose asChild>
          <Button
            className={baseButtonClassName}
            onClick={() => {
              removeLocalStorage("closingTabs");
              loadingRoom();
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
