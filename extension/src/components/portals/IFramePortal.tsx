import { URLS } from "@cb/constants";
import { useLeetCodeProblemsHtmlActions } from "@cb/hooks/store";
import React from "react";

export const IFramePortal: React.FC = () => {
  const { setHtmlElement } = useLeetCodeProblemsHtmlActions();

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
