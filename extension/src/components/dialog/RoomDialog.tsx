import { Button } from "@cb/lib/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTrigger,
} from "@cb/lib/components/ui/dialog";
import { defaultTo as d } from "@cb/utils";
import { cn } from "@cb/utils/cn";
import { DialogTitle } from "@radix-ui/react-dialog";
import React from "react";

//note that the classname from leetcode is not applying because dialog is not in leetcode environment. We could still use classname from our tailwind tho.
export const baseButtonClassName =
  "rounded-md text-black dark:text-white py-2 font-medium text-base transition hover:bg-[--color-button-hover-background] bg-[--color-button-background] border-transparent hover:border-black dark:hover:border-white border";

// export interface RoomDialogProps {
//   trigger: React.ReactNode;
//   open?: boolean;
//   onOpenChange?: (open: boolean) => void;
//   modal?: boolean;
//   contentClassName?: string;
//   headerClassName?: string;
//   title: string;
//   description?: string;
//   children?: React.ReactNode;
//   footer?: React.ReactNode;
//   onContentClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
// }

interface RoomDialogProps {
  dialog?: {
    props: React.ComponentProps<typeof Dialog>;
  };
  trigger?: {
    label: string;
    props?: React.ComponentProps<typeof DialogTrigger>;
  };
  title: {
    node: React.ReactNode;
    props?: React.ComponentProps<typeof DialogHeader>;
  };
  content?: {
    props: React.ComponentProps<typeof DialogDescription>;
  };
  children?: React.ReactNode;
}

export const RoomDialog: React.FC<RoomDialogProps> = ({
  dialog,
  trigger,
  title,
  content,
  children,
}) => {
  return (
    <Dialog {...d(dialog?.props, {})}>
      {trigger && (
        <DialogTrigger asChild>
          <Button
            {...d(trigger?.props, {})}
            className={cn(
              "flex items-center justify-center w-[150px] hover:bg-[--color-button-hover-background] bg-[--color-button-background] dark:hover:bg-[--color-button-hover-background] dark:bg-[--color-button-background]",
              trigger?.props?.className
            )}
            aria-label={trigger.label}
          >
            {trigger.label}
          </Button>
        </DialogTrigger>
      )}
      <DialogContent
        {...d(content?.props, {})}
        className={cn(
          "bg-white dark:bg-dark-layer-bg",
          content?.props.className
        )}
      >
        <DialogTitle
          {...d(title.props, {})}
          className={cn("text-left text-xl font-semibold")}
        >
          {title.node}
        </DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
};
