import { Skeleton } from "@cb/components/ui/Skeleton";
import { usePeerSelection } from "@cb/hooks/index";
import { cn } from "@cb/utils/cn";
import React from "react";
import { EDITOR_NODE_ID } from "../EditorPanel";
import { EditorToolBar } from "../EditorToolBar";

export const CodeTab: React.FC = () => {
  const { isBuffer } = usePeerSelection();
  return (
    <>
      {isBuffer && <Skeleton className="h-full w-full" />}
      <div
        className={cn("relative flex h-full w-full grow flex-col gap-y-2", {
          hidden: isBuffer,
        })}
      >
        <EditorToolBar />
        <div
          id={EDITOR_NODE_ID}
          className={cn("h-full w-full overflow-hidden")}
        />
      </div>
    </>
  );
};
