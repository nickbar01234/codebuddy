import { ColorAwareUserIcon } from "@cb/components/icons/ColorAwareUserIcon";
import { CSS } from "@cb/constants";
import { useRoomActions, useRoomData } from "@cb/hooks/store";
import { TableCell } from "@cb/lib/components/ui/table";
import { Question } from "@cb/types";
import { DefaultTableRow } from "./DefaultTableRow";

interface UserAwareTableRowProps {
  question: Question;
}

export const UserAwareTableRow = ({ question }: UserAwareTableRowProps) => {
  const { selectQuestion } = useRoomActions();
  const { users } = useRoomData();
  const usersInQuestion = users.filter((user) => {
    try {
      return getQuestionIdFromUrl(user.url ?? "") === question.slug;
    } catch {
      return false;
    }
  });

  return (
    <DefaultTableRow
      className="cursor-pointer"
      onClick={() => selectQuestion(constructUrlFromQuestionId(question.slug))}
    >
      <TableCell className="w-6/12 overflow-hidden text-ellipsis whitespace-nowrap font-medium">
        {question.id}.&nbsp;{question.title}
      </TableCell>
      <TableCell className="w-3/12">
        <span
          className={cn(CSS.DIFFICULTY[question.difficulty], "font-medium")}
        >
          {question.difficulty}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          {usersInQuestion.map((user) => (
            <ColorAwareUserIcon
              key={user.user}
              css={user.css}
              user={user.user}
            />
          ))}
        </div>
      </TableCell>
    </DefaultTableRow>
  );
};
