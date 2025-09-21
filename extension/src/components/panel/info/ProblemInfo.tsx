import { DefaultTable } from "@cb/components/table/DefaultTable";
import { DefaultTableBody } from "@cb/components/table/DefaultTableBody";
import { DefaultTableHeader } from "@cb/components/table/DefaultTableHeader";
import { DefaultTableRow } from "@cb/components/table/DefaultTableRow";
import { CSS, FEATURE_FLAG } from "@cb/constants";
import { useRoomActions, useRoomData } from "@cb/hooks/store";
import { TableCell } from "@cb/lib/components/ui/table";
import { SidebarTabIdentifier } from "@cb/store";
import { DialogTitle } from "@radix-ui/react-dialog";
import { SidebarTabLayout } from "./SidebarTabLayout";

export const ProblemInfo = () => {
  const { questions } = useRoomData();
  const { selectQuestion } = useRoomActions();

  return (
    <SidebarTabLayout forTab={SidebarTabIdentifier.ROOM_QUESTIONS}>
      <DialogTitle className="text-secondary text-2xl">
        Problem Queue
      </DialogTitle>
      <div className="h-full w-full flex flex-col justify-between overflow-hidden">
        <DefaultTable loading={questions.length === 0}>
          <DefaultTableHeader
            headers={
              FEATURE_FLAG.DISABLE_USER_TRACKING
                ? ["Question", "Difficulty", ""]
                : ["Question", "Difficulty", "Users"]
            }
          />
          <DefaultTableBody>
            {questions.map((question) => (
              <DefaultTableRow
                key={question.id}
                className="cursor-pointer"
                onClick={() =>
                  selectQuestion(constructUrlFromQuestionId(question.slug))
                }
              >
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
      </div>
    </SidebarTabLayout>
  );
};
