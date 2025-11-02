import { QuestionSelectorPanel } from "@cb/components/panel/problem";
import { DefaultTable } from "@cb/components/table/DefaultTable";
import { DefaultTableBody } from "@cb/components/table/DefaultTableBody";
import { DefaultTableHeader } from "@cb/components/table/DefaultTableHeader";
import { UserAwareTableRow } from "@cb/components/table/UserAwareTableRow";
import { useHtmlActions, useRoomActions, useRoomData } from "@cb/hooks/store";
import { Separator } from "@cb/lib/components/ui/separator";
import { Tabs, TabsContent, TabsList } from "@cb/lib/components/ui/tabs";
import { SidebarTabIdentifier } from "@cb/store";
import { DialogTitle } from "@radix-ui/react-dialog";
import { TabsTrigger } from "@radix-ui/react-tabs";
import React from "react";
import { SidebarTabHeader, SidebarTabLayout } from "./SidebarTabLayout";

// todo(nickbar01234): Persist state even after sidebar is closed?
enum ProblemInfoTab {
  CHOSEN_QUESTIONS = "chosen_questions",
  CHOOSE_NEXT_QUESTION = "choose_next_question",
}

export const ProblemInfo = () => {
  const { questions, activeSidebarTab } = useRoomData();
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

  const tabs = React.useMemo(
    () => [
      {
        value: "Problem Queue",
        label: ProblemInfoTab.CHOSEN_QUESTIONS,
        content: (
          <DefaultTable loading={questions.length === 0}>
            <DefaultTableHeader headers={["Question", "Difficulty", "Users"]} />
            <DefaultTableBody>
              {questions.map((question) => (
                <UserAwareTableRow key={question.id} question={question} />
              ))}
            </DefaultTableBody>
          </DefaultTable>
        ),
      },
      {
        value: "Add Problem",
        label: ProblemInfoTab.CHOOSE_NEXT_QUESTION,
        content: (
          <QuestionSelectorPanel
            handleQuestionSelect={handleQuestionSelect}
            filterQuestions={questions}
          />
        ),
      },
    ],
    [handleQuestionSelect, questions]
  );

  return (
    <SidebarTabLayout forTab={SidebarTabIdentifier.ROOM_QUESTIONS}>
      <Tabs className="h-full w-full bg-inherit flex flex-col gap-4">
        <SidebarTabHeader>
          <TabsList className="hide-scrollbar flex h-fit w-full justify-start gap-2 overflow-x-auto text-inherit bg-inherit">
            {tabs.map((tab, idx) => (
              <React.Fragment key={tab.value}>
                <TabsTrigger
                  value={tab.value}
                  className={cn(
                    "rounded-none border-transparent bg-transparent hover:rounded-sm hover:bg-[--color-tabset-tabbar-background] data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:bg-transparent p-2"
                  )}
                >
                  <DialogTitle className="text-2xl">{tab.value}</DialogTitle>
                </TabsTrigger>
                {idx !== tabs.length - 1 && (
                  <Separator
                    orientation="vertical"
                    className="flexlayout__tabset_tab_divider h-8 bg-[--color-tabset-tabbar-background]"
                  />
                )}
              </React.Fragment>
            ))}
          </TabsList>
        </SidebarTabHeader>
        {tabs.map(({ value, content }) => (
          <TabsContent
            key={value}
            value={value}
            forceMount
            className="data-[state=inactive]:hidden hide-scrollbar overflow-auto h-full oveflow-y-hidden w-full mt-0"
          >
            {content}
          </TabsContent>
        ))}
      </Tabs>
    </SidebarTabLayout>
  );
};
