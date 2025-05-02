import { QuestionSelectorPanel } from "@cb/components/panel/problem";
import { useRTC } from "@cb/hooks";
import React, { useState } from "react";
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
  const { handleChooseQuestion, roomId } = useRTC();
  const [panel, setPanel] = useState<React.ReactNode | null>(null);
  const [isMount, setIsMount] = useState(false);
  // useEffect(() => {
  //   if (roomId !== null){
  //     setIsMount(true)
  //   }
  // }, [roomId])
  // useEffect(() => {
  //   if (roomId !== null){
  //     setPanel(
  //       <QuestionSelectorPanel
  //       handleQuestionSelect={(question) => {
  //         handleChooseQuestion(question);
  //         setOpen(false);
  //       }}
  //       filterQuestionIds={[]}
  //       container={{}}
  //     />
  //     )
  //   }
  // }, [roomId])
  return (
    <>
      {/* {roomId !== null && <QuestionSelectorPanel
        handleQuestionSelect={(question) => {
          handleChooseQuestion(question);
          setOpen(false);
        }}
        filterQuestionIds={[]}
        container={{}}
      />
} */}
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
            onOpenChange: setOpen,
          },
        }}
        content={{
          props: {
            className:
              "h-[90vh] max-w-[1100px] py-6 px-3 bg-layer-1 bg-white dark:bg-dark-layer-bg flex flex-col gap-4",
          },
        }}
        title={{ node: "Select next problem" }}
      >
        <QuestionSelectorPanel
          handleQuestionSelect={(question) => {
            handleChooseQuestion(question);
            setOpen(false);
          }}
          filterQuestionIds={[]}
          container={{}}
        />
      </RoomDialog>
    </>
  );
};
