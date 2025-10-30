import { PANEL } from "@cb/constants";
import { useAppActions, useAppPreference } from "@cb/hooks/store";
import { Resizable } from "re-resizable";
import { useRef } from "react";
import { ImperativePanelHandle } from "react-resizable-panels";
import { CollapsedPanel } from "./CollapsedPanel";

interface ResizableLayoutPanelProps {
  leetCodeRoot: Element;
  children?: React.ReactNode;
}

// todo(nickbar01234): Deprecate component
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
    <Resizable
      defaultSize={{ width, height: "100%" }}
      className="ml-2"
      enable={{
        top: false,
        right: false,
        bottom: false,
        left: true,
        topRight: false,
        bottomRight: false,
        bottomLeft: false,
        topLeft: false,
      }}
      minWidth={PANEL.MIN_PANEL_SIZE}
      handleStyles={{
        left: {
          cursor: "default",
        },
      }}
      onResizeStop={(_event, _direction, ref) => {
        console.log("Stopping", ref.getBoundingClientRect().width);
        setAppWidth(ref.getBoundingClientRect().width);
      }}
      handleComponent={{
        left: (
          <div
            id="CodeBuddyHandle"
            className={cn(
              "absolute -left-1/3 flexlayout__splitter flexlayout__splitter_vert w-2 h-full hover:after:h-full hover:after:bg-[--color-splitter-drag] after:h-[20px] after:bg-[--color-splitter] cursor-ew-resize",
              { hidden: !enabled }
            )}
          />
        ),
      }}
    >
      <div className={cn("h-full", { hidden: !enabled })}>
        {collapsed && <CollapsedPanel />}
        <div
          data-collapsed={collapsed}
          className="h-full w-full data-[collapsed=true]:hidden"
        >
          {children}
        </div>
      </div>
    </Resizable>
    // <ResizablePanelGroup direction="horizontal">
    //   <ResizablePanel>
    //     <div
    //       className="relative h-full w-full"
    //       ref={(ref) => ref?.appendChild(leetCodeRoot)}
    //     />
    //   </ResizablePanel>

    //   <ResizableHandle
    //     className={cn(
    //       "flexlayout__splitter flexlayout__splitter_vert w-2 h-full hover:after:h-full hover:after:bg-[--color-splitter-drag] after:h-[20px] after:bg-[--color-splitter] cursor-ew-resize",
    //       { hidden: !enabled }
    //     )}
    //     onDoubleClick={() => handleDoubleClick(collapsed)}
    //   />

    //   <ResizablePanel
    //     ref={panelRef}
    //     collapsible
    //     collapsedSize={COLLAPSED_SIZE}
    //     defaultSize={width}
    //     minSize={DEFAULT_PANEL_SIZE}
    //     onCollapse={collapseExtension}
    //     onExpand={expandExtension}
    //     onResize={setAppWidth}
    //     className={cn({ hidden: !enabled })}
    //   >
    //   </ResizablePanel>
    // </ResizablePanelGroup>
  );
};
