import { useAppActions, useAppPreference } from "@cb/hooks/store";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@cb/lib/components/ui/resizable";
import { COLLAPSED_SIZE, DEFAULT_PANEL_SIZE } from "@cb/store";
import { useRef } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import { CollapsedPanel } from "./CollapsedPanel";

interface ResizableLayoutPanelProps {
  leetCodeRoot: Element;
  children?: React.ReactNode;
}

export const ResizableGroupLayoutPanel = ({
  leetCodeRoot,
  children,
}: ResizableLayoutPanelProps) => {
  const { enabled, width, collapsed } = useAppPreference();
  const panelRef = useRef<ImperativePanelHandle>(null);
  const { collapseExtension, expandExtension, setAppWidth, handleDoubleClick } =
    useAppActions({
      panelRef,
    });

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
        onDoubleClick={() => handleDoubleClick(collapsed)}
      />

      <ResizablePanel
        ref={panelRef}
        collapsible
        collapsedSize={COLLAPSED_SIZE}
        defaultSize={width}
        minSize={DEFAULT_PANEL_SIZE}
        onCollapse={collapseExtension}
        onExpand={expandExtension}
        onResize={setAppWidth}
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
