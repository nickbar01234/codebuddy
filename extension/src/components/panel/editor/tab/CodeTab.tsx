import { EDITOR_NODE_ID } from "@cb/components/panel/editor/EditorPanel";
import { usePeerSelection } from "@cb/hooks";
import { Copy } from "lucide-react";
import React from "react";

export const CodeTab: React.FC = () => {
  const { pasteCode } = usePeerSelection();

  return (
    <div className="relative h-full w-full">
      <div className="absolute top-0 right-0 pr-6 z-50">
        <button
          title="Paste code"
          type="button"
          data-tooltip-target="tooltip-default"
          onClick={pasteCode}
          className="hover:bg-fill-quaternary dark:hover:bg-fill-quaternary inline-flex items-center justify-between focus:outline-none focus:ring-4"
        >
          <Copy size={16} />
        </button>
      </div>
      <div
        id={EDITOR_NODE_ID}
        className="h-full min-h-[50vh] w-full overflow-hidden"
      />
    </div>
  );
};
