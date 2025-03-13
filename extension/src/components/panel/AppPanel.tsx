import { CollapsedPanel } from "@cb/components/panel/CollapsedPanel";
import { VerticalHandle } from "@cb/components/panel/Handle";
import { MIN_WIDTH } from "@cb/context/WindowProvider";
import { useWindowDimensions } from "@cb/hooks";
import React from "react";
import { ResizableBox } from "react-resizable";
interface AppPanelProps {
  children?: React.ReactNode;
}

export const AppPanel = (props: AppPanelProps) => {
  const {
    preference: { appPreference },
    setAppWidth,
    onResizeStop,
    toggleWidth,
  } = useWindowDimensions();

  return (
    <ResizableBox
      width={appPreference.isCollapsed ? MIN_WIDTH : appPreference.width}
      axis="x"
      resizeHandles={["w"]}
      className="relative flex h-full"
      handle={<div onDoubleClick={toggleWidth}>{VerticalHandle}</div>}
      minConstraints={[MIN_WIDTH, 0]}
      onResize={(_e, data) => setAppWidth(data.size.width)}
      onResizeStop={onResizeStop}
    >
      <div className="bg-layer-1 dark:bg-dark-layer-1 ml-2 box-border h-full w-full rounded-lg">
        {appPreference.isCollapsed && <CollapsedPanel />}
        <div
          data-collapsed={appPreference.isCollapsed}
          className="h-full w-full data-[collapsed=true]:hidden"
        >
          {props.children}
        </div>
      </div>
    </ResizableBox>
  );
};
