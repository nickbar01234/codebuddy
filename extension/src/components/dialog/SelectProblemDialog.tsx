import { QuestionSelectorPanel } from "@cb/components/panel/problem";
import { windowMessager } from "@cb/services/window";
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
            "h-[90vh] max-w-[1100px] py-6 px-3 bg-primary flex flex-col gap-4",
        },
      }}
      title={{ node: "Select next problem" }}
    >
      <QuestionSelectorPanel
        handleQuestionSelect={(question) => {
          windowMessager.navigate({ url: question });
          setOpen(false);
        }}
        filterQuestionIds={[]}
        container={{}}
        visible={open}
      />
    </RoomDialog>
  );
};
