import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cb/lib/components/ui/dialog";
import React from "react";

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
}

export const RoomDialog: React.FC<RoomDialogProps> = ({
  trigger,
  open,
  onOpenChange,
  modal = false,
  contentClassName = "w-auto",
  headerClassName = "",
  title,
  description,
  children,
  footer,
}) => (
  <Dialog open={open} onOpenChange={onOpenChange} modal={modal}>
    <DialogTrigger asChild>{trigger}</DialogTrigger>
    <DialogContent
      className={contentClassName}
      onClick={(e) => e.stopPropagation()}
    >
      <DialogHeader className={headerClassName}>
        <DialogTitle className="text-left text-xl">{title}</DialogTitle>
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
