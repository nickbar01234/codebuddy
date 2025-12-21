import { useRoomActions, useRoomData } from "@cb/hooks/store";
import { Button } from "@cb/lib/components/ui/button";
import { cn } from "@cb/utils/cn";
import { DialogOverlay } from "@radix-ui/react-dialog";
import { throttle } from "lodash";
import React from "react";
import { RoomDialog, baseButtonClassName } from "./RoomDialog";

export const AlreadyInRoomDialog = () => {
  const { join } = useRoomActions();
  const { id } = useRoomData();

  const onJoinRoom = React.useMemo(() => {
    return throttle(async (reactEvent: React.MouseEvent<Element>) => {
      reactEvent.stopPropagation();
      if (id) {
        await join(id);
      }
    }, 1000);
  }, [join, id]);

  return (
    <RoomDialog
      title={{ node: "This account is already in the room" }}
      content={{
        props: {
          className:
            "w-[400px] gap-y-4 rounded-xl bg-white p-6 text-lg text-[#1E1E1E] dark:bg-[#262626] shadow-lg dark:text-[#FFFFFF]",
          onClick: (e) => e.stopPropagation(),
        },
      }}
      overlay={
        <DialogOverlay className="fixed inset-0 z-[9999] dark:bg-black/30 bg-white/30 backdrop-blur-sm" />
      }
    >
      <div className="flex flex-col gap-4">
        <p>
          We found this account already associated with this room. Joining again
          (for example, from another tab or window) may cause the session to
          break.
        </p>
        <div className="flex w-full items-center justify-end gap-2 self-end">
          <Button
            className={cn(baseButtonClassName, "w-full")}
            onClick={(e) => e.stopPropagation()}
          >
            Cancel
          </Button>

          <Button onClick={onJoinRoom}>Join anyway</Button>
        </div>
      </div>
    </RoomDialog>
  );
};
