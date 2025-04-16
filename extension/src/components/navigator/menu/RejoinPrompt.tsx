import { RenderButton } from "@cb/components/ui/RenderButton";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@cb/lib/components/ui/dialog";

export const RejoinPrompt = () => {
  return (
    <Dialog open={true} modal={true}>
      <DialogContent className="hidden-close">
        <DialogHeader>
          <DialogTitle className="text-left text-xl">
            Do you want to rejoin the room?
          </DialogTitle>
          <DialogDescription className="text-left font-medium">
            You will be disconnected, and you may not be able to rejoin unless
            invited again.
          </DialogDescription>
          <div className="mt-6 flex w-full items-center justify-end gap-2 self-end">
            <DialogClose asChild>
              <RenderButton label="Yes" isYes />
            </DialogClose>
            <DialogClose asChild>
              <RenderButton label="No" />
            </DialogClose>
          </div>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
