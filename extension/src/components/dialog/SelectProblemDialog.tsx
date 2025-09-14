import { QuestionSelectorPanel } from "@cb/components/panel/problem";
import { useRoomActions } from "@cb/hooks/store";
import { useHtml } from "@cb/store/htmlStore";
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
  const iframeActions = useHtml((state) => state.actions);
  const { addQuestion } = useRoomActions();
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
            iframeActions.hideHtml();
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
        container={{}}
      />
    </RoomDialog>
  );
};
