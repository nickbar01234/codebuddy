import { useOnMount } from "@cb/hooks";
import { getStorage, setStorage } from "@cb/services";
import { ExtensionStorage } from "@cb/types";
import React from "react";
import { ResizableBox } from "react-resizable";
import { VerticalHandle } from "./Handle";
import CollapsedPabel from "./CollapsedPanel";

interface AppPanelProps {
  children?: React.ReactNode;
}

const AppPanel = (props: AppPanelProps) => {
  const [editorPreference, setEditorPreference] = React.useState<
    ExtensionStorage["editorPreference"] | null
  >(null);

  const minWidth = 35; // Set the minimum width threshold

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
      minConstraints={[minWidth, 500]}
      onResize={(_e, data) => {
        setEditorPreference({
          ...editorPreference,
          width: data.size.width,
          isCollapsed: data.size.width == minWidth,
        });
        console.log(editorPreference);
      }}
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
      {editorPreference.isCollapsed ? (
        <CollapsedPabel />
      ) : (
        <div className="w-full box-border ml-2 rounded-lg bg-layer-1 dark:bg-dark-layer-1 h-full">
          {props.children}
        </div>
      )}
    </ResizableBox>
  );
};

export default AppPanel;
