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
  const { appPreference, setAppWidth, onResizeStop } = useWindowDimensions();

  return (
    <ResizableBox
      width={appPreference.width}
      axis="x"
      resizeHandles={["w"]}
      className="h-full flex relative"
      handle={VerticalHandle}
      minConstraints={[MIN_WIDTH, 0]}
      onResize={(_e, data) => setAppWidth(data.size.width)}
      onResizeStop={onResizeStop}
    >
      <div className="w-full box-border ml-2 rounded-lg bg-layer-1 dark:bg-dark-layer-1 h-full">
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
