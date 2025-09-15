import { SelectProblemDialog } from "@cb/components/dialog/SelectProblemDialog";
import { DefaultTable } from "@cb/components/table/DefaultTable";
import { DefaultTableBody } from "@cb/components/table/DefaultTableBody";
import { DefaultTableHeader } from "@cb/components/table/DefaultTableHeader";
import { DefaultTableRow } from "@cb/components/table/DefaultTableRow";
import { CSS } from "@cb/constants";
import { useRoomQuestions } from "@cb/hooks/store";
import { Button } from "@cb/lib/components/ui/button";
import { TableCell } from "@cb/lib/components/ui/table";
import { Grid2X2, List } from "lucide-react";
import React from "react";
import { BaseInfoSheet } from "./BaseInfoSheet";

export const ProblemInfo = () => {
  const [open, setOpen] = React.useState(false);
  const questions = useRoomQuestions();

  console.log(questions);
  return (
    <BaseInfoSheet trigger={<List />}>
      <div className="h-full w-full flex flex-col justify-between">
        <DefaultTable loading={questions.length === 0}>
          <DefaultTableHeader headers={["Question", "Difficulty", "Users"]} />
          <DefaultTableBody>
            {questions.map((question) => (
              <DefaultTableRow key={question.id}>
                <TableCell className="w-6/12 overflow-hidden text-ellipsis whitespace-nowrap font-medium">
                  {question.id}.&nbsp;{question.title}
                </TableCell>
                <TableCell className="w-3/12">
                  <span
                    className={cn(
                      CSS.DIFFICULTY[question.difficulty],
                      "font-medium"
                    )}
                  >
                    {question.difficulty}
                  </span>
                </TableCell>
                <TableCell className="w-3/12"></TableCell>
              </DefaultTableRow>
            ))}
          </DefaultTableBody>
        </DefaultTable>
        {/* todo(nickbar01234): Fix UI */}
        <SelectProblemDialog
          trigger={{
            customTrigger: true,
            node: (
              <div className="relative inline-block">
                <Button className="bg-[#DD5471] hover:bg-[#DD5471]/80 text-white rounded-md flex items-center gap-2 px-4 py-2 font-medium">
                  <Grid2X2 className="h-5 w-5 text-white" />
                  Select next problem
                </Button>
                <div className="absolute -top-[0.3rem] -right-[0.3rem] w-3 h-3 bg-[#FF3B30] rounded-full border-[4px] border-background" />
              </div>
            ),
          }}
          open={open}
          setOpen={setOpen}
        />
      </div>
    </BaseInfoSheet>
  );
};
