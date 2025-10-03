import { URLS } from "@cb/constants";
import { useHtmlElement } from "@cb/hooks/store";
import React from "react";

export const IframeContainer: React.FC = () => {
  const htmlElement = useHtmlElement();
  return (
    <iframe
      ref={htmlElement}
      src={URLS.PROBLEMSET}
      title="LeetCode Question"
      className="hidden"
      sandbox="allow-scripts allow-same-origin"
    />
  );
};
