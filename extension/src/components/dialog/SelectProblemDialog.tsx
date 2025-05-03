import { QuestionSelectorPanel } from "@cb/components/panel/problem";
import { useRTC } from "@cb/hooks";
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
  const { handleChooseQuestion } = useRTC();

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
  );
};
