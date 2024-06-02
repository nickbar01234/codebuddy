import { ResizableBox } from "react-resizable";
import { VerticalHandle } from "./Handle";
import EditorProvider, { Tab } from "./editor";

const AppPanel = () => {
  return (
    // TODO(nickbar01234) - Save user preference in local storage
    <ResizableBox
      width={200}
      axis="x"
      resizeHandles={["w"]}
      className="h-full flex relative"
      handle={VerticalHandle}
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
