import { URLS } from "@cb/constants";
import { useHtml } from "@cb/store/htmlStore";
import React from "react";

export const IframeContainer: React.FC = () => {
  const htmlElement = useHtml((state) => state.htmlElement);
  return (
    <iframe
      ref={htmlElement}
      src={URLS.PROBLEMSET}
      title="LeetCode Question"
      className="hidden z-[1000]"
      sandbox="allow-scripts allow-same-origin"
    />
  );
};
