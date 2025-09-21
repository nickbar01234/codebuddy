import { QuestionSelectorPanel } from "@cb/components/panel/problem";
import { useRoomActions, useRoomData } from "@cb/hooks/store";
import { SidebarTabIdentifier } from "@cb/store";
import { useHtml } from "@cb/store/htmlStore";
import { DialogTitle } from "@radix-ui/react-dialog";
import React from "react";
import { SidebarTabLayout } from "./SidebarTabLayout";

export const LeetCodeQuestions = () => {
  const { activeSidebarTab } = useRoomData();
  const { addQuestion, closeSidebarTab } = useRoomActions();
  const hideHtml = useHtml((state) => state.actions.hideHtml);

  React.useEffect(() => {
    if (activeSidebarTab === undefined) hideHtml();
  }, [activeSidebarTab, hideHtml]);

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
      />
    </SidebarTabLayout>
  );
};
