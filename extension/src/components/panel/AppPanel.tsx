import { ResizableBox } from "react-resizable";
import { VerticalHandle } from "./Handle";
import EditorProvider, { Tab } from "./editor";
import React from "react";
import { ExtensionStorage } from "@types";
import { useOnMount } from "@hooks/index";
import { getStorage, setStorage } from "@services";

const AppPanel = () => {
  const [editorPreference, setEditorPreference] = React.useState<
    ExtensionStorage["editorPreference"] | null
  >(null);

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
      onResize={(_e, data) =>
        setEditorPreference({
          ...editorPreference,
          width: data.size.width,
        })
      }
      onResizeStop={(_e, data) =>
        setStorage({
          editorPreference: {
            ...editorPreference,
            width: data.size.width,
          },
        })
      }
    >
      <div className="w-full box-border ml-2 rounded-lg bg-layer-1 dark:bg-dark-layer-1 h-full">
        <EditorProvider defaultActiveId="Nick">
          <Tab id="Nick" displayHeader="Nick">
            Hello world
          </Tab>
          <Tab id="Hung" displayHeader="Hung">
            Bye world
          </Tab>
        </EditorProvider>
      </div>
    </ResizableBox>
  );
};

export default AppPanel;
