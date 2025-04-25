import { cn } from "@cb/utils/cn";
import React from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface SelectButtonQuestionProps
  extends React.HtmlHTMLAttributes<HTMLButtonElement> {}

export const SelectQuestionButton = ({
  className,
  ...props
}: SelectButtonQuestionProps) => {
  return (
    // todo(nickbar01234) - Adding manual margin left to align the other columns. We should find a better method
    <div
      className="z-[100] !pointer-events-auto relative ml-7 mr-2 flex items-center py-[11px]"
      role="cell"
    >
      <button
        className={cn("rounded-md p-2 text-white", className)}
        style={{ backgroundColor: "#DD5471" }}
        {...props}
      >
        Select
      </button>
    </div>
  );
};
