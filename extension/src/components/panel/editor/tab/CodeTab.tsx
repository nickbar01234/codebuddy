import { Tooltip } from "@cb/components/tooltip";
import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { DOM } from "@cb/constants";
import { useCopyCode } from "@cb/hooks/editor";
import { Copy } from "lucide-react";
import React from "react";

export const CodeTab: React.FC = () => {
  const copyCode = useCopyCode();
  return (
    <SkeletonWrapper loading={false} className="relative">
      <div className="absolute top-2 right-0 pr-6 z-50">
        <Tooltip
          trigger={{
            node: (
              <div
                data-testid="copy-code"
                className="h-fit hover:bg-fill-quaternary dark:hover:bg-fill-quaternary inline-flex items-center justify-between focus:outline-none p-2 rounded-md cursor-pointer"
                onClick={copyCode}
              >
                <Copy size={16} />
              </div>
            ),
          }}
          content="Copy code"
        />
      </div>
      <div
        id={DOM.CODEBUDDY_EDITOR_ID}
        className="h-full w-full overflow-hidden"
      />
    </SkeletonWrapper>
  );
};
