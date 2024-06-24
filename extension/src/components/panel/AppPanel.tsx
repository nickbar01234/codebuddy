import React from "react";
import { ResizableBox } from "react-resizable";
import { useOnMount } from "@cb/hooks";
import { getStorage, setStorage } from "@cb/services";
import { ExtensionStorage } from "@cb/types";
import { VerticalHandle } from "@cb/components/panel/Handle";
import { CollapsedPanel } from "@cb/components/panel/CollapsedPanel";

interface AppPanelProps {
  children?: React.ReactNode;
}

export const AppPanel = (props: AppPanelProps) => {
  const [editorPreference, setEditorPreference] = React.useState<
    ExtensionStorage["editorPreference"] | null
  >(null);

  const minWidth = 40; // Set the minimum width threshold

  useOnMount(() => {
    getStorage("editorPreference").then(setEditorPreference);
  });
  // TODO(nickbar01234) - Handle loading indicator

  if (editorPreference == null) {
    return null;
  }

  return (
    <ResizableBox
      width={editorPreference.width}
      axis="x"
      resizeHandles={["w"]}
      className="h-full flex relative"
      handle={VerticalHandle}
      minConstraints={[minWidth, 0]}
      onResize={(_e, data) =>
        setEditorPreference({
          ...editorPreference,
          width: data.size.width,
          isCollapsed: data.size.width == minWidth,
        })
      }
      onResizeStop={(_e, data) =>
        setStorage({
          editorPreference: {
            ...editorPreference,
            width: data.size.width,
            isCollapsed: data.size.width == minWidth,
          },
        })
      }
    >
      <div className="w-full box-border ml-2 rounded-lg bg-layer-1 dark:bg-dark-layer-1 h-full">
        {editorPreference.isCollapsed && <CollapsedPanel />}
        <div
          className={`h-full w-full ${
            editorPreference.isCollapsed ? "hidden" : ""
          }`}
        >
          <div id="trackEditor" className="hidden"></div>
          {props.children}
        </div>
      </div>
    </ResizableBox>
  );
};
