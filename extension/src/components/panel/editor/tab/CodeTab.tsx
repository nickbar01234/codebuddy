import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { useCodeBuddyMonacoHtmlActions } from "@cb/hooks/store";
import React from "react";

// note: This needs to match the sidepanel icons
const MONACO_EDITOR_Z_INDEX = 1000;

export const CodeTab: React.FC = () => {
  const { showHtml } = useCodeBuddyMonacoHtmlActions();

  const onContainerRefCallback = React.useCallback(
    (node: HTMLElement | null) => {
      if (!node) return;

      let lastRect: DOMRect;
      let animationFrameId: number;
      const repositionIframeOnPositionChange = () => {
        const rect = node.getBoundingClientRect();
        if (
          !lastRect ||
          rect.top !== lastRect.top ||
          rect.left !== lastRect.left
        ) {
          showHtml(node, MONACO_EDITOR_Z_INDEX);
          lastRect = rect;
        }
        animationFrameId = requestAnimationFrame(
          repositionIframeOnPositionChange
        );
      };

      animationFrameId = requestAnimationFrame(
        repositionIframeOnPositionChange
      );

      const repositionIframeOnWindowResize = () => {
        lastRect = node.getBoundingClientRect();
        showHtml(node, MONACO_EDITOR_Z_INDEX);
      };

      window.addEventListener("resize", repositionIframeOnPositionChange);

      return () => {
        cancelAnimationFrame(animationFrameId);
        window.removeEventListener("resize", repositionIframeOnWindowResize);
      };
    },
    [showHtml]
  );

  return (
    <SkeletonWrapper loading={false} className="relative">
      <div ref={onContainerRefCallback} className="h-full w-full" />
    </SkeletonWrapper>
  );
};
