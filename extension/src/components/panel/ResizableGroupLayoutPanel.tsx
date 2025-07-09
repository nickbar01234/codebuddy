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
    extension: { width, collapsed },
  } = useAppSelector((state) => state.layout);
  const dispatch = useAppDispatch();

  return (
    <ResizablePanelGroup id="resizable-panel-group" direction="horizontal">
      <ResizablePanel id="resizable-panel-before-div">
        <div
          className="relative h-full w-full"
          ref={(ref) => ref?.appendChild(leetCodeRoot)}
        />
      </ResizablePanel>
      <ResizableHandle
        id="resizable-handle"
        className="flexlayout__splitter flexlayout__splitter_vert w-2 h-full hover:after:h-full hover:after:bg-[--color-splitter-drag] after:h-[20px] after:bg-[--color-splitter] cursor-ew-resize"
      />
      <ResizablePanel
        id="resizable-panel-collapsible"
        collapsible
        collapsedSize={COLLAPSED_SIZE}
        defaultSize={width}
        minSize={DEFAULT_PANEL_SIZE}
        onCollapse={() => dispatch(collapseExtension())}
        onExpand={() => dispatch(expandExtension())}
      >
        {collapsed && <CollapsedPanel />}
        <div
          id="div-after-collapse-panel"
          data-collapsed={collapsed}
          className="h-full w-full data-[collapsed=true]:hidden"
        >
          {children}
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};
