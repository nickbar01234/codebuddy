import { useRoomActions, useRoomData, useRoomStatus } from "@cb/hooks/store";
import { Button } from "@cb/lib/components/ui/button";
import { DialogClose } from "@cb/lib/components/ui/dialog";
import { windowMessager } from "@cb/services/window";
import { RoomStatus } from "@cb/store";
import { throttle } from "lodash";
import React from "react";
import { RoomDialog, baseButtonClassName } from "./RoomDialog";

export const RejoinPromptDialog = () => {
  const { leave } = useRoomActions();
  const { questions, self } = useRoomData();
  const roomStatus = useRoomStatus();

  const leaveRoomThrottled = React.useMemo(() => {
    return throttle((event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation?.();
      leave();
    }, 1000);
  }, [leave]);

  return (
    <RoomDialog
      title={{
        node: "Do you want to rejoin?",
      }}
      description={{
        node: `The current question is not queued. If yes, you will be navigated to ${questions[0]?.title}. Otherwise, you will leave the room.`,
      }}
      dialog={{
        props: {
          open:
            roomStatus === RoomStatus.IN_ROOM &&
            questions.every((question) => question.url !== self?.url) &&
            questions.length > 0,
          modal: true,
        },
      }}
      content={{
        props: {
          className: "[&>button]:hidden",
        },
      }}
    >
      <div className="mt-6 flex w-full items-center justify-end gap-2 self-end">
        <DialogClose asChild>
          <Button
            className={baseButtonClassName}
            onClick={() => windowMessager.navigate({ url: questions[0].url })}
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
