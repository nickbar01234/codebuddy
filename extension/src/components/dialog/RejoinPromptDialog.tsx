import { AppState } from "@cb/context/AppStateProvider";
import { useAppState, useRTC } from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import { DialogClose } from "@cb/lib/components/ui/dialog";
import { removeLocalStorage } from "@cb/services";
import { RoomDialog, baseButtonClassName } from "./RoomDialog";

export const RejoinPromptDialog = () => {
  const { joiningBackRoom } = useRTC();
  const { setState } = useAppState();

  const handleClick = (yes: boolean) => {
    removeLocalStorage("closingTabs");
    joiningBackRoom(yes);
    if (yes) {
      setState(AppState.LOADING);
    } else {
      setState(AppState.HOME);
    }
  };

  return (
    <RoomDialog
      title={{ node: "" }}
      // trigger={<></>}
      // open={true}
      // modal={true}
      // title="Do you want to rejoin the room?"
      // description="You will rejoin on the current question of the room"
    >
      <div className="mt-6 flex w-full items-center justify-end gap-2 self-end">
        <DialogClose asChild>
          <Button
            className={baseButtonClassName}
            onClick={() => handleClick(true)}
          >
            <span className="text-sm font-medium">Yes</span>
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button
            className={baseButtonClassName}
            onClick={() => handleClick(false)}
          >
            <span className="text-sm font-medium">No</span>
          </Button>
        </DialogClose>
      </div>
    </RoomDialog>
  );
};
