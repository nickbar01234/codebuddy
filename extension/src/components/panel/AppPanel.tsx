import { CollapsedPanel } from "@cb/components/panel/CollapsedPanel";
import { VerticalHandle } from "@cb/components/panel/Handle";
import { useWindow } from "@cb/hooks/useWindow";
import { MIN_WIDTH } from "@cb/state/slices/windowSlice";
import React from "react";
import { ResizableBox, ResizeCallbackData } from "react-resizable";

interface AppPanelProps {
  children?: React.ReactNode;
}

export const AppPanel = (props: AppPanelProps) => {
  const {
    preference: { appPreference },
    setAppWidth,
    toggleWidth,
    onResizeStop,
  } = useWindow();

  const handleResize = (
    _e: React.SyntheticEvent<Element, Event>,
    data: ResizeCallbackData
  ) => {
    setAppWidth(data.size.width);
  };

  const handleResizeStop = (
    _e: React.SyntheticEvent<Element, Event>,
    data: ResizeCallbackData
  ) => {
    setAppWidth(data.size.width);
    onResizeStop();
  };

  const handleDoubleClick = () => {
    toggleWidth();
  };

  return (
    <ResizableBox
      width={appPreference.isCollapsed ? MIN_WIDTH : appPreference.width}
      axis="x"
      resizeHandles={["w"]}
      className="relative flex h-full"
      handle={<div onDoubleClick={handleDoubleClick}>{VerticalHandle}</div>}
      minConstraints={[MIN_WIDTH, 0]}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
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
