import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cb/lib/components/ui/dialog";
import React from "react";

//note that the classname from leetcode is not applying because dialog is not in leetcode environment. We could still use classname from our tailwind tho.
export const baseButtonClassName =
  "rounded-md text-black dark:text-white py-2 font-medium text-base transition hover:bg-[--color-button-hover-background] bg-[--color-button-background] border-transparent hover:border-black dark:hover:border-white border";

export interface RoomDialogProps {
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  contentClassName?: string;
  headerClassName?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  onContentClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

export const RoomDialog: React.FC<RoomDialogProps> = ({
  trigger,
  open,
  onOpenChange,
  modal,
  contentClassName = "w-auto",
  headerClassName = "",
  title,
  description,
  children,
  footer,
  onContentClick,
}) => (
  <Dialog {...{ open, onOpenChange, modal }}>
    <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent className={contentClassName}>
      <DialogHeader className={headerClassName}>
        <DialogTitle
          className="text-left text-xl font-semibold"
          onClick={onContentClick}
        >
          {title}
        </DialogTitle>
        {description && (
          <DialogDescription className="text-left font-medium">
            {description}
          </DialogDescription>
        )}
      </DialogHeader>
      <div className="mt-4">{children}</div>
      {footer && (
        <div className="mt-6 flex w-full items-center justify-end gap-2">
          {footer}
        </div>
      )}
    </DialogContent>
  </Dialog>
);
