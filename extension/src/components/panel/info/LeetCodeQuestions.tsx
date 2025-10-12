import { QuestionSelectorPanel } from "@cb/components/panel/problem";
import { useHtmlActions, useRoomActions, useRoomData } from "@cb/hooks/store";
import { SidebarTabIdentifier } from "@cb/store";
import { DialogTitle } from "@radix-ui/react-dialog";
import React from "react";
import { SidebarTabHeader, SidebarTabLayout } from "./SidebarTabLayout";

export const LeetCodeQuestions = () => {
  const { activeSidebarTab, questions } = useRoomData();
  const { addQuestion, closeSidebarTab } = useRoomActions();
  const { hideHtml } = useHtmlActions();

  React.useEffect(() => {
    if (activeSidebarTab === undefined) hideHtml();
  }, [activeSidebarTab, hideHtml]);

  const handleQuestionSelect = React.useCallback(
    (url: string) => {
      // todo(nickbar01234): Loading animation?
      addQuestion(url).then(() => closeSidebarTab());
    },
    [addQuestion, closeSidebarTab]
  );

  return (
    <SidebarTabLayout forTab={SidebarTabIdentifier.LEETCODE_QUESTIONS}>
      <SidebarTabHeader>
        <DialogTitle className="text-2xl text-secondary">
          Select next problem
        </DialogTitle>
      </SidebarTabHeader>
      <QuestionSelectorPanel
        handleQuestionSelect={handleQuestionSelect}
        filterQuestions={questions}
      />
    </SidebarTabLayout>
  );
};
