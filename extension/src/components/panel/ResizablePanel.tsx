import { PANEL } from "@cb/constants";
import { useAppActions, useAppPreference } from "@cb/hooks/store";
import React from "react";
import { Resizable } from "react-resizable";
import { CollapsedPanel } from "./CollapsedPanel";

interface ResizablePanelProps {
  children?: React.ReactNode;
}

export const ResizablePanel = ({ children }: ResizablePanelProps) => {
  const { enabled, width, collapsed } = useAppPreference();
  const { collapseOrExpand, setAppWidth } = useAppActions();

  return (
    <Resizable
      width={width}
      axis="x"
      minConstraints={[PANEL.COLLAPSED_WIDTH, Infinity]}
      handle={
        <div
          className={cn(
            "absolute -left-2 top-1/2 -translate-y-1/2 flexlayout__splitter flexlayout__splitter_vert w-2 h-full hover:after:h-full hover:after:bg-[--color-splitter-drag] after:h-[20px] after:bg-[--color-splitter] cursor-ew-resize",
            { hidden: !enabled }
          )}
          onDoubleClick={collapseOrExpand}
        />
      }
      resizeHandles={["w"]}
      onResize={(e, data) => setAppWidth(data.size.width)}
    >
      <div
        className={cn("relative ml-2 h-full w-full", {
          "duration-100 ease-in-out transition-[width]": collapsed,
        })}
        style={{ width: `${width}px` }}
      >
        {collapsed && <CollapsedPanel />}
        <div className={cn("h-full w-full", { hidden: collapsed })}>
          {children}
        </div>
      </div>
    </Resizable>
  );
};
