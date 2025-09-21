import { useRoomActions } from "@cb/hooks/store";
import { Button } from "@cb/lib/components/ui/button";
import { DialogClose } from "@cb/lib/components/ui/dialog";
import { DialogOverlay } from "@radix-ui/react-dialog";
import { throttle } from "lodash";
import { CornerUpLeft } from "lucide-react";
import React from "react";
import { RoomDialog, baseButtonClassName } from "./RoomDialog";

export function LeaveRoomDialog() {
  const { leave, closeSidebarTab } = useRoomActions();

  const leaveRoomThrottled = React.useMemo(() => {
    return throttle((event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation?.();
      leave();
      closeSidebarTab();
    }, 1000);
  }, [leave, closeSidebarTab]);

  return (
    <RoomDialog
      title={{ node: "Are you sure that you want to leave the room?" }}
      description={{
        node: "You will be disconnected, and you may not be able to rejoin unless invited again.",
      }}
      trigger={{
        customTrigger: true,
        label: "Leave Room",
        node: <CornerUpLeft />,
      }}
      content={{ props: { className: "z-[9999]" } }}
      overlay={
        <DialogOverlay className="fixed inset-0 z-[9999] dark:bg-black/30 bg-white/30 backdrop-blur-sm" />
      }
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
