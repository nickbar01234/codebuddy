import { useAppActions, useAppPreference } from "@cb/hooks/store";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@cb/lib/components/ui/resizable";
import { COLLAPSED_SIZE, DEFAULT_PANEL_SIZE } from "@cb/store";
import { cn } from "@cb/utils/cn";
import { useEffect, useRef } from "react";
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

  useEffect(() => {
    const leetCodeElement = leetCodeRoot as HTMLElement;
    const extensionRoot = document.getElementById("CodeBuddy");
    const parentContainer = extensionRoot?.parentElement;

    if (!leetCodeElement || !extensionRoot || !parentContainer) return;

    if (enabled) {
      parentContainer.style.display = "flex";
      parentContainer.style.flexDirection = "row";
      parentContainer.style.width = "100%";
      parentContainer.style.height = "100%";

      leetCodeElement.style.flex = "1";
      leetCodeElement.style.minWidth = "0";
      leetCodeElement.style.height = "100%";
      leetCodeElement.style.overflow = "auto";

      extensionRoot.style.flex = `0 0 ${width}%`;
      extensionRoot.style.width = `${width}%`;
      extensionRoot.style.height = "100%";
      extensionRoot.style.display = "flex";
    } else {
      parentContainer.style.display = "";
      parentContainer.style.flexDirection = "";
      parentContainer.style.width = "";
      parentContainer.style.height = "";

      leetCodeElement.style.flex = "";
      leetCodeElement.style.minWidth = "";
      leetCodeElement.style.height = "";
      leetCodeElement.style.overflow = "";

      extensionRoot.style.flex = "";
      extensionRoot.style.width = "";
      extensionRoot.style.height = "";
      extensionRoot.style.display = "none";
    }

    return () => {
      if (parentContainer) {
        parentContainer.style.display = "";
        parentContainer.style.flexDirection = "";
      }
    };
  }, [enabled, width, leetCodeRoot]);

  if (!enabled) {
    return null;
  }

  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={100 - width} minSize={30}>
        <div className="h-full w-full" />
      </ResizablePanel>

      <ResizableHandle
        className={cn(
          "flexlayout__splitter flexlayout__splitter_vert w-2 h-full hover:after:h-full hover:after:bg-[--color-splitter-drag] after:h-[20px] after:bg-[--color-splitter] cursor-ew-resize"
        )}
        withHandle
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
