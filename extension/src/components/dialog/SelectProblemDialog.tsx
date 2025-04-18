import { QuestionSelectorPanel } from "@cb/components/panel/problem";
import { useRTC } from "@cb/hooks";
import React from "react";
import { RoomDialog } from "./RoomDialog";

interface SelectProblemDialog {
  trigger: React.ReactNode;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export const SelectProblemDialog = ({
  trigger,
  open,
  setOpen,
}: SelectProblemDialog) => {
  const { handleChooseQuestion } = useRTC();

  return (
    <RoomDialog
      trigger={{
        node: trigger,
        label: "Select next problem",
      }}
      dialog={{
        props: {
          open,
          modal: true,
          onOpenChange: setOpen,
        },
      }}
      content={{
        props: {
          className:
            "h-[90vh] min-w-[80%] max-w-[80%] p-0 bg-layer-1 bg-white dark:bg-dark-layer-bg",
        },
      }}
    >
      <div className="py-6 px-3 grid grid-rows-[5%_95%] gap-4 overflow-hidden">
        <h2 className="font-medium text-xl">Select next problem</h2>
        {/* todo(nickbar01234): Figure out how to not unmount this component */}
        <QuestionSelectorPanel
          handleQuestionSelect={(question) => {
            handleChooseQuestion(question);
            setOpen(false);
          }}
          container={{}}
        />
      </div>
    </RoomDialog>
  );
};
