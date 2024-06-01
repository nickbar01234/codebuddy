import { ResizableBox } from "react-resizable";
import AppHandle from "./AppHandle";

const AppPanel = () => {
  return (
    // TODO(nickbar01234) - Save user preference in local storage
    <ResizableBox
      width={200}
      axis="x"
      resizeHandles={["w"]}
      className="h-full flex relative"
      handle={
        <div>
          <AppHandle />
        </div>
      }
    >
      <div className="w-full box-border ml-2 rounded-lg bg-layer-1 dark:bg-dark-layer-1 p-2 h-full">
        Code Buddy
      </div>
    </ResizableBox>
  );
};

export default AppPanel;
