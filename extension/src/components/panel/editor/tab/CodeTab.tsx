import React from "react";
import { EDITOR_NODE_ID } from "../EditorPanel";
import { EditorToolBar } from "../EditorToolBar";

export const CodeTab: React.FC = () => {
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
