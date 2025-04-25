import { Button } from "@cb/lib/components/ui/button";
import { cn } from "@cb/utils/cn";
import React from "react";

interface SelectButtonQuestionProps
  extends React.HtmlHTMLAttributes<HTMLButtonElement> {
  containerClassName?: string;
}

export const SelectQuestionButton = ({
  className,
  containerClassName,
  ...props
}: SelectButtonQuestionProps) => {
  return (
    // todo(nickbar01234) - Adding manual margin left to align the other columns. We should find a better method
    <div
      className={cn(
        "z-[100] !pointer-events-auto relative ml-7 mr-2 flex items-center py-[11px]",
        containerClassName
      )}
      role="cell"
    >
      <Button
        className={cn("rounded-md p-2 text-white", className)}
        style={{ backgroundColor: "#DD5471" }}
        {...props}
      >
        Select
      </Button>
    </div>
  );
};
