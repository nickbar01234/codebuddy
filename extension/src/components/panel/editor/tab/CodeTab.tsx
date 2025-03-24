import React from "react";
import { EditorToolBar } from "../EditorToolBar";
import { EDITOR_NODE_ID } from "../EditorPanel";

const CodeTab: React.FC = () => {
  return (
    <div className="h-full w-full">
      <EditorToolBar />
      <div
        id={EDITOR_NODE_ID}
        className="h-full min-h-[50vh] w-full overflow-hidden"
      />
    </div>
  );
};

export default CodeTab;
