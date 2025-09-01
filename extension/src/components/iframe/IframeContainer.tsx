import { DOM, URLS } from "@cb/constants";
import { IframeService } from "@cb/services/iframe";
import React, { useEffect, useRef } from "react";

// global
let iframeService: IframeService | null = null;

export const getIframeService = () => iframeService;

export const IframeContainer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (containerRef.current && iframeRef.current) {
      containerRef.current.id =
        DOM.INJECTED_LEETCODE_PROBLEMSET_IFRAME_CONTAINER;
      iframeRef.current.id = DOM.INJECTED_LEETCODE_PROBLEMSET_IFRAME;
      iframeService = new IframeService(
        iframeRef.current,
        containerRef.current
      );
    }
  }, []);

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
