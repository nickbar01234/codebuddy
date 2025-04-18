import { QuestionSelectorPanel } from "@cb/components/panel/problem";
import { useRTC } from "@cb/hooks";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@cb/lib/components/ui/dialog";
import React from "react";

interface SelectProblemDialog {
  trigger: React.ReactNode;
}

export const SelectProblemDialog = ({ trigger }: SelectProblemDialog) => {
  const { handleChooseQuestion } = useRTC();
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        className="h-[90vh] min-w-[80%] max-w-[80%] p-0 bg-layer-1 bg-white dark:bg-dark-layer-bg"
        forceMount
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
      </DialogContent>
    </Dialog>
  );
};
