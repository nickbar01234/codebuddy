import { QuestionSelectorPanel } from "@cb/components/panel/problem";
import { useRoomActions } from "@cb/hooks/store";
import { SidebarTabIdentifier } from "@cb/store";
import { useHtml } from "@cb/store/htmlStore";
import { DialogTitle } from "@radix-ui/react-dialog";
import React from "react";
import { SidebarTabLayout } from "./SidebarTabLayout";

export const LeetCodeQuestions = () => {
  const { addQuestion, closeSidebarTab } = useRoomActions();
  const showHtml = useHtml((state) => state.actions.showHtml);

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
          showHtml(node);
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
        showHtml(node);
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
    <SidebarTabLayout forTab={SidebarTabIdentifier.LEETCODE_QUESTIONS}>
      <DialogTitle className="text-2xl text-secondary">
        Select next problem
      </DialogTitle>
      <QuestionSelectorPanel
        handleQuestionSelect={(url) =>
          // todo(nickbar01234): Loading animation?
          addQuestion(url).then(() => closeSidebarTab())
        }
        filterQuestionIds={[]}
        onContainerRefCallback={onContainerRefCallback}
      />
    </SidebarTabLayout>
  );
};
