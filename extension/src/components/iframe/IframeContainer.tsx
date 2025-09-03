import { DOM, URLS } from "@cb/constants";
import { useHtml } from "@cb/store/htmlStore";
import React, { useEffect, useRef } from "react";

export const IframeContainer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { actions } = useHtml();

  useEffect(() => {
    if (containerRef.current && iframeRef.current) {
      containerRef.current.id =
        DOM.INJECTED_LEETCODE_PROBLEMSET_IFRAME_CONTAINER;
      iframeRef.current.id = DOM.INJECTED_LEETCODE_PROBLEMSET_IFRAME;
      actions.initialize(iframeRef.current, containerRef.current);
    }
  }, [actions]);

  return (
    <div ref={containerRef} className="hidden pointer-events-none">
      <iframe
        ref={iframeRef}
        src={URLS.PROBLEMSET}
        title="LeetCode Question"
        className="h-full w-full border-2 border-[#78788033]"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};
