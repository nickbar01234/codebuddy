import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@cb/lib/components/ui/resizable";
import { COLLAPSED_SIZE, DEFAULT_PANEL_SIZE, useApp } from "@cb/store";
import { debounce } from "lodash";
import React from "react";
import { useShallow } from "zustand/shallow";
import { CollapsedPanel } from "./CollapsedPanel";

interface ResizableLayoutPanelProps {
  leetCodeRoot: Element;
  children?: React.ReactNode;
}

export const ResizableGroupLayoutPanel = ({
  leetCodeRoot,
  children,
}: ResizableLayoutPanelProps) => {
  const { enabled, width, collapsed } = useApp((state) => state.app);
  const { collapseExtension, expandExtension, setAppWidth } = useApp(
    useShallow((state) => ({
      collapseExtension: state.actions.collapseExtension,
      expandExtension: state.actions.expandExtension,
      setAppWidth: state.actions.setAppWidth,
    }))
  );
  const debouncedSetAppWidth = React.useMemo(
    () => debounce(setAppWidth, 1000),
    [setAppWidth]
  );

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
        onCollapse={collapseExtension}
        onExpand={expandExtension}
        onResize={debouncedSetAppWidth}
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
