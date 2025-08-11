import { Button } from "@cb/lib/components/ui/button";
import { DialogClose } from "@cb/lib/components/ui/dialog";
import { getLocalStorage, setLocalStorage } from "@cb/services";
import { getSessionId } from "@cb/utils";
import { baseButtonClassName, RoomDialog } from "./RoomDialog";

interface PromptNavigateDialogProps {
  finished: boolean;
}

// todo(nickbar01234): This doesn't do anything
export const PromptNavigateDialog = ({
  finished,
}: PromptNavigateDialogProps) => {
  const navigatePrompt = getLocalStorage("navigatePrompt") ?? {};
  const displayPrompt = finished && !(navigatePrompt[getSessionId()] ?? false);

  const onDecision = () =>
    setLocalStorage("navigatePrompt", {
      ...navigatePrompt,
      [getSessionId()]: true,
    });

  const onNavigate = () => {
    onDecision();
  };

  return (
    <RoomDialog
      title={{ node: "Do you want to navigate to the next question?" }}
      dialog={{
        props: {
          open: displayPrompt,
          onOpenChange: (open) => {
            if (!open) onDecision();
          },
        },
      }}
      // todo(nickbar01234): Actually specify the link
      description={{
        node: "All users have finished the current question. By clicking yes, you will be redirected to another url",
      }}
    >
      <div className="mt-6 flex w-full items-center justify-end gap-2 self-end">
        <DialogClose asChild>
          <Button className={baseButtonClassName} onClick={onNavigate}>
            <span className="text-sm font-medium">Yes</span>
          </Button>
        </DialogClose>
        <DialogClose asChild>
          <Button className={baseButtonClassName} onClick={onDecision}>
            <span className="text-sm font-medium">No</span>
          </Button>
        </DialogClose>
      </div>
    </RoomDialog>
  );
};
