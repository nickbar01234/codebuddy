import { CollapsedPanel } from "@cb/components/panel/CollapsedPanel";
import { VerticalHandle } from "@cb/components/panel/Handle";
import { useWindowListener } from "@cb/hooks/listeners";
import { useWindow } from "@cb/hooks/useWindow";
import { MIN_WIDTH } from "@cb/state/slices/windowSlice";
import { Resizable, ResizeCallback } from "re-resizable";
import React from "react";

interface AppPanelProps {
  children?: React.ReactNode;
}

export const AppPanel = (props: AppPanelProps) => {
  const {
    preference: { appPreference },
    setAppWidth,
    onResizeStop,
  } = useWindow();

  const handleResizeStop: ResizeCallback = (_e, _direction, _ref, delta) => {
    setAppWidth(appPreference.width + delta.width);
    onResizeStop();
  };

  useWindowListener();

  return (
    <Resizable
      size={{
        width: appPreference.isCollapsed ? MIN_WIDTH : appPreference.width,
        height: "100%",
      }}
      // todo(nickbar01234): Need to use onResize instead of onResizeStop? Otherwise, if you start by collapsing, you
      // end up in a weird partial state
      onResizeStop={handleResizeStop}
      boundsByDirection
      minWidth={MIN_WIDTH}
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
      // todo(nickbaro1234): toggle width
      handleComponent={{ left: <VerticalHandle /> }}
      className="relative h-full"
    >
      <div className="bg-secondary ml-2 box-border h-full w-full rounded-lg">
        {appPreference.isCollapsed && <CollapsedPanel />}
        <div
          data-collapsed={appPreference.isCollapsed}
          className="h-full w-full data-[collapsed=true]:hidden"
        >
          {props.children}
        </div>
      </div>
    </Resizable>
  );
};
