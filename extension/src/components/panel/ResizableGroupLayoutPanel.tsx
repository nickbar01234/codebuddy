import { useAppDispatch, useAppSelector } from "@cb/hooks/redux";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@cb/lib/components/ui/resizable";
import {
  COLLAPSED_SIZE,
  collapseExtension,
  DEFAULT_PANEL_SIZE,
  expandExtension,
} from "@cb/state/slices/layoutSlice";
import React from "react";
import { CollapsedPanel } from "./CollapsedPanel";

interface ResizableLayoutPanelProps {
  leetCodeRoot: Element;
  children?: React.ReactNode;
}

export const ResizableGroupLayoutPanel = ({
  leetCodeRoot,
  children,
}: ResizableLayoutPanelProps) => {
  const {
    app: { enabled },
    extension: { width, collapsed },
  } = useAppSelector((state) => state.layout);
  const dispatch = useAppDispatch();

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel>
        <div
          className="relative h-full w-full"
          ref={(ref) => ref?.appendChild(leetCodeRoot)}
        />
      </ResizablePanel>
      <ResizableHandle
        className={cn(
          "flexlayout__splitter flexlayout__splitter_vert w-2 h-full hover:after:h-full hover:after:bg-[--color-splitter-drag] after:h-[20px] after:bg-[--color-splitter] cursor-ew-resize",
          { hidden: !enabled }
        )}
      />
      <ResizablePanel
        collapsible
        collapsedSize={COLLAPSED_SIZE}
        defaultSize={width}
        minSize={DEFAULT_PANEL_SIZE}
        onCollapse={() => dispatch(collapseExtension())}
        onExpand={() => dispatch(expandExtension())}
        className={cn({ hidden: !enabled })}
      >
        {collapsed && <CollapsedPanel />}
        <div
          data-collapsed={collapsed}
          className="h-full w-full data-[collapsed=true]:hidden"
        >
          {children}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
