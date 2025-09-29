import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { DOM } from "@cb/constants";
import React from "react";

export const CodeTab: React.FC = () => {
  return (
    <SkeletonWrapper loading={false} className="relative">
      <div
        id={DOM.CODEBUDDY_EDITOR_ID}
        className="h-full w-full overflow-hidden"
      />
    </SkeletonWrapper>
  );
};
