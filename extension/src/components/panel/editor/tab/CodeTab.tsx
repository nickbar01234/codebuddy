import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { DOM } from "@cb/constants";
import { cn } from "@cb/utils/cn";
import { Copy } from "lucide-react";
import React from "react";

export const CodeTab: React.FC = () => {
  // todo(nikbar01234): Fix logic
  const isBuffer = false;
  const pasteCode = () => {};

  return (
    <SkeletonWrapper loading={isBuffer} className="relative">
      <div
        className={cn("relative flex h-full w-full grow flex-col gap-y-2", {
          hidden: isBuffer,
        })}
      >
        <div className="absolute top-2 right-0 pr-6 z-50">
          <button
            title="Paste code"
            type="button"
            data-tooltip-target="tooltip-default"
            onClick={pasteCode}
            className="hover:bg-fill-quaternary dark:hover:bg-fill-quaternary inline-flex items-center justify-between focus:outline-none focus:ring-4"
          >
            <Copy size={16} />
          </button>
        </div>
        <div
          id={DOM.CODEBUDDY_EDITOR_ID}
          className={cn("h-full w-full overflow-hidden")}
        />
      </div>
    </SkeletonWrapper>
  );
};
