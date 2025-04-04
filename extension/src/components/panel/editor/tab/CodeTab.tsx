import { EDITOR_NODE_ID } from "@cb/components/panel/editor/EditorPanel";
import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { usePeerSelection } from "@cb/hooks";
import { cn } from "@cb/utils/cn";
import { Copy } from "lucide-react";
import React from "react";

export const CodeTab: React.FC = () => {
  const { isBuffer } = usePeerSelection();
  const { pasteCode } = usePeerSelection();

  return (
    <SkeletonWrapper loading={isBuffer} className="relative">
      <div
        className={cn("relative flex h-full w-full grow flex-col gap-y-2", {
          hidden: isBuffer,
        })}
      >
        <div className="absolute top-0 right-0 pr-6 z-50">
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
          id={EDITOR_NODE_ID}
          className={cn("h-full w-full overflow-hidden")}
        />
      </div>
    </SkeletonWrapper>
  );
};
