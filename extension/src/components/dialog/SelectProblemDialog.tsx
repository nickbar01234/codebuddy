import { QuestionSelectorPanel } from "@cb/components/panel/problem";
import { useRoomActions } from "@cb/hooks/store";
import { useHtml } from "@cb/store/htmlStore";
import React from "react";
import { RoomDialog, RoomDialogProps } from "./RoomDialog";

interface SelectProblemDialog {
  trigger: Partial<RoomDialogProps["trigger"]>;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const SelectProblemDialog = ({
  trigger,
  open,
  setOpen,
}: SelectProblemDialog) => {
  const showHtml = useHtml((state) => state.actions.showHtml);
  const hideHtml = useHtml((state) => state.actions.hideHtml);
  const { addQuestion } = useRoomActions();

  // Callback ref that runs side effects when the container is available
  const onContainerRefCallback = React.useCallback(
    (node: HTMLElement | null) => {
      if (node) {
        showHtml(node);
        let animationFrameId: number;
        // repositioning synchronized with browser frames
        const throttledRepositionIframe = () => {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
          }
          animationFrameId = requestAnimationFrame(() => {
            // Add a small delay to ensure dialog recentering completes
            requestAnimationFrame(() => showHtml(node));
          });
        };

        // Watch for container size changes
        const resizeObserver = new ResizeObserver(throttledRepositionIframe);
        resizeObserver.observe(node);
        window.addEventListener("resize", throttledRepositionIframe);

        return () => {
          if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
            resizeObserver.disconnect();
            window.removeEventListener("resize", throttledRepositionIframe);
          }
        };
      }
    },
    [showHtml]
  );

  return (
    <RoomDialog
      trigger={{
        label: "Select next problem",
        node: "Select next problem",
        ...(trigger ?? {}),
      }}
      dialog={{
        props: {
          open,
          modal: true,
          onOpenChange: (state) => {
            hideHtml();
            setOpen(state);
          },
        },
      }}
      content={{
        props: {
          className:
            "h-[90vh] max-w-[1100px] py-6 px-3 bg-primary flex flex-col gap-4",
        },
      }}
      title={{ node: "Select next problem" }}
    >
      <QuestionSelectorPanel
        handleQuestionSelect={(url) => {
          addQuestion(url);
          setOpen(false);
        }}
        filterQuestionIds={[]}
        onContainerRefCallback={onContainerRefCallback}
      />
    </RoomDialog>
  );
};
