import { URLS } from "@cb/constants";
import { useHtml } from "@cb/store/htmlStore";
import React from "react";

export const IframeContainer: React.FC = () => {
  const hiddenContainer = useHtml((state) => state.hiddenContainer);
  const htmlElement = useHtml((state) => state.htmlElement);

  return (
    <div ref={hiddenContainer} className="hidden pointer-events-none">
      <iframe
        ref={htmlElement}
        src={URLS.PROBLEMSET}
        title="LeetCode Question"
        className="h-full w-full border-2 border-[#78788033]"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};
