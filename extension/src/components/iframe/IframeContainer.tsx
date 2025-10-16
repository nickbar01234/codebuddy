import { URLS } from "@cb/constants";
import { useHtmlActions } from "@cb/hooks/store";
import React from "react";

export const IframeContainer: React.FC = () => {
  const { setHtmlElement } = useHtmlActions();

  return (
    <iframe
      ref={(node) => setHtmlElement(node)}
      src={URLS.PROBLEMSET}
      title="LeetCode Question"
      className="hidden"
      sandbox="allow-scripts allow-same-origin"
    />
  );
};
