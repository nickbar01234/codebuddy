import { AppState } from "@cb/context/AppStateProvider";
import { useAppState, useRTC } from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import { DialogClose } from "@cb/lib/components/ui/dialog";
import { removeLocalStorage } from "@cb/services";
import { LeaveRoomDialog } from "./LeaveRoomDialog";
import { RoomDialog, baseButtonClassName } from "./RoomDialog";

export const RejoinPromptDialog = () => {
  const { joiningBackRoom } = useRTC();
  const { setState } = useAppState();

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
              setState(AppState.LOADING);
            }}
          >
            <span className="text-sm font-medium">Yes</span>
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <LeaveRoomDialog
            trigger={
              <Button
                className={baseButtonClassName}
                onClick={() => {
                  removeLocalStorage("closingTabs");
                  setState(AppState.HOME);
                }}
              >
                <span className="text-sm font-medium">No</span>
              </Button>
            }
          />
        </DialogClose>
      </div>
    </RoomDialog>
  );
};
