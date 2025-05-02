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
import React, { ReactNode } from "react";

//note that the classname from leetcode is not applying because dialog is not in leetcode environment. We could still use classname from our tailwind tho.
export const baseButtonClassName =
  "rounded-md text-[#1E1E1E] dark:text-white py-2 font-medium text-base transition hover:bg-[--color-button-hover-background] bg-[--color-button-background] border-transparent hover:border-black dark:hover:border-white border";

export interface RoomDialogProps {
  dialog?: {
    props: React.ComponentProps<typeof Dialog>;
  };
  trigger?: {
    label: string;
    node: ReactNode;
    props?: React.ComponentProps<typeof DialogTrigger>;
    // If true, node is treated as a trigger and no Button is wrapped over
    customTrigger?: boolean;
  };
  title?: {
    node: React.ReactNode;
    props?: React.ComponentProps<typeof DialogHeader>;
  };
  description?: {
    node: React.ReactNode;
    props?: React.ComponentProps<typeof DialogDescription>;
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
  description,
}) => {
  console.log("RoomDialog", dialog?.props);
  console.log("Trigger in room dialog", trigger);
  console.log("Title in room dialog", title);
  console.log("Children in room dialog", children);
  return (
    <Dialog {...d(dialog?.props, {})}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger.customTrigger ? (
            trigger.node
          ) : (
            // todo(nickbar01234): For some reason, background doesn't override in light mode?
            <div className="bg-[--color-button-background]">
              <Button
                {...d(trigger?.props, {})}
                className={cn(
                  // "flex items-center justify-center dark:text-white text-[#1E1E1E] w-[150px] hover:bg-[--color-button-hover-background] bg-[--color-button-background] dark:hover:bg-[--color-button-hover-background] dark:bg-[--color-button-background]",
                  "flex items-center justify-center w-[150px]",
                  baseButtonClassName,
                  trigger?.props?.className
                )}
                aria-label={trigger.label}
              >
                {trigger.node}
              </Button>
            </div>
          )}
        </DialogTrigger>
      )}
      <DialogContent
        {...d(content?.props, {})}
        forceMount
        className={cn(
          "bg-white dark:bg-dark-layer-bg",
          content?.props.className
        )}
      >
        {title && (
          <DialogHeader>
            <DialogTitle
              {...d(title.props, {})}
              className={cn("text-left text-xl font-semibold")}
            >
              {title.node}
            </DialogTitle>
            {description && (
              <DialogDescription
                {...d(description.props, {})}
                className={cn(
                  "text-left text-base font-medium",
                  description?.props?.className
                )}
              >
                {description.node}
              </DialogDescription>
            )}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  );
};
