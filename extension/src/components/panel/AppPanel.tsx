import { ResizableBox } from "react-resizable";
import { VerticalHandle } from "./Handle";
import EditorProvider, { Tab } from "./editor";
import IndividualTab from "./IndividualTab";
import RTCProvider from "@cb/context/RTCProvider";

const AppPanel = () => {
  return (
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
            <RTCProvider>
              <IndividualTab />
            </RTCProvider>
          </Tab>
          <Tab id="Hung" displayHeader="Hung">
            <RTCProvider>
              <IndividualTab />
            </RTCProvider>
          </Tab>
        </EditorProvider>
      </div>
    </ResizableBox>
  );
};

export default AppPanel;
