import React from "react";
import { ResizableBox } from "react-resizable";
import { useOnMount } from "@cb/hooks";
import {
  getChromeStorage,
  sendServiceRequest,
  setChromeStorage,
} from "@cb/services";
import { ExtensionStorage } from "@cb/types";
import { VerticalHandle } from "@cb/components/panel/Handle";
import { CollapsedPanel } from "@cb/components/panel/CollapsedPanel";
import { CodeBuddyPreference } from "@cb/constants";

interface AppPanelProps {
  children?: React.ReactNode;
}

export const AppPanel = (props: AppPanelProps) => {
  const [appPreference, setAppPreference] = React.useState<
    ExtensionStorage["appPreference"]
  >(CodeBuddyPreference.appPreference);

  const minWidth = 40; // Set the minimum width threshold

  useOnMount(() => {
    getChromeStorage("appPreference").then(setAppPreference);
  });

  return (
    <ResizableBox
      width={appPreference.width}
      axis="x"
      resizeHandles={["w"]}
      className="h-full flex relative"
      handle={VerticalHandle}
      minConstraints={[minWidth, 0]}
      onResize={(_e, data) =>
        setAppPreference({
          ...appPreference,
          width: data.size.width,
          isCollapsed: data.size.width === minWidth,
        })
      }
      onResizeStop={(_e, data) => {
        setChromeStorage({
          appPreference: {
            ...appPreference,
            width: data.size.width,
            isCollapsed: data.size.width === minWidth,
          },
        });
        sendServiceRequest({
          action: "updateEditorLayout",
          monacoEditorId: "CodeBuddy",
        });
      }}
    >
      <div className="w-full box-border ml-2 rounded-lg bg-layer-1 dark:bg-dark-layer-1 h-full">
        {appPreference.isCollapsed && <CollapsedPanel />}
        <div
          data-collapsed={appPreference.isCollapsed}
          className="h-full w-full data-[collapsed=true]:hidden"
        >
          <div id="trackEditor" className="hidden" />
          {props.children}
        </div>
      </div>
    </ResizableBox>
  );
};
