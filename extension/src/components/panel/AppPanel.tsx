import { ResizableBox } from "react-resizable";

const AppPanel = () => {
  return (
    // TODO(nickbar01234) - Save user preference in local storage
    <ResizableBox width={200} axis="x" resizeHandles={["w"]} className="h-full">
      <div className="ml-2 box-border rounded-lg bg-layer-1 dark:bg-dark-layer-1 p-2 h-full">
        Code Buddy
      </div>
    </ResizableBox>
  );
};

export default AppPanel;
