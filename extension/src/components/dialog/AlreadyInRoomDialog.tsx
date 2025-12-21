import { Button } from "@cb/lib/components/ui/button";
import { DialogClose } from "@cb/lib/components/ui/dialog";
import { cn } from "@cb/utils/cn";
import { DialogOverlay } from "@radix-ui/react-dialog";
import { RoomDialog, baseButtonClassName } from "./RoomDialog";

interface AlreadyInRoomDialogProps {
  onConfirm: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onCancel: (event: React.MouseEvent<HTMLButtonElement>) => void;
}
export const AlreadyInRoomDialog = ({
  onConfirm,
  onCancel,
}: AlreadyInRoomDialogProps) => {
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
      <div className="flex w-full items-center justify-end gap-2">
        <DialogClose asChild>
          <Button
            className={cn(baseButtonClassName, "flex-1")}
            onClick={onCancel}
          >
            Cancel
          </Button>
        </DialogClose>
        <Button
          className={cn(baseButtonClassName, "flex-1 bg-orange-500")}
          onClick={onConfirm}
        >
          Join anyway
        </Button>
      </div>
    </RoomDialog>
  );
};
