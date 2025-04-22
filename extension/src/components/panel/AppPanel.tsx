import { CollapsedPanel } from "@cb/components/panel/CollapsedPanel";
import { VerticalHandle } from "@cb/components/panel/Handle";
import { useAppDispatch, useAppSelector } from "@cb/state/hooks"; // adjust path
import { MIN_WIDTH, setAppWidth } from "@cb/state/slices/windowSlice";
import {
  savePreferenceNow,
  toggleWidthAndSave,
} from "@cb/state/thunks/windowThunks";
import React from "react";
import { ResizableBox } from "react-resizable";

interface AppPanelProps {
  children?: React.ReactNode;
}

export const AppPanel = (props: AppPanelProps) => {
  const dispatch = useAppDispatch();
  const appPreference = useAppSelector(
    (state) => state.window.preference.appPreference
  );

  const handleResize = (_e: any, data: { size: { width: number } }) => {
    dispatch(setAppWidth(data.size.width));
  };

  const handleResizeStop = () => {
    dispatch(savePreferenceNow());
  };

  const handleDoubleClick = () => {
    dispatch(toggleWidthAndSave());
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
