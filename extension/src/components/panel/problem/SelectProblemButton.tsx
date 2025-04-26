import { Button } from "@cb/lib/components/ui/button";
import { cn } from "@cb/utils/cn";
import React from "react";

interface SelectButtonQuestionProps
  extends React.HtmlHTMLAttributes<HTMLButtonElement> {
  containerClassName?: string;
}

const dev = import.meta.env.MODE === "development";

export const SelectQuestionButton = ({
  className,
  containerClassName,
  ...props
}: SelectButtonQuestionProps) => {
  return (
    // todo(nickbar01234) - Adding manual margin left to align the other columns. We should find a better method
    <div
      className={cn(
        "z-[100] relative flex items-center",
        { "ml-7 mr-2 py-[11px]": dev },
        containerClassName
      )}
      role="cell"
    >
      <Button
        className={cn("rounded-md p-2 text-white", { "h-8": !dev }, className)}
        style={{ backgroundColor: "#DD5471" }}
        {...props}
      >
        Select
      </Button>
    </div>
  );
};
