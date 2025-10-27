import { DefaultTable } from "@cb/components/table/DefaultTable";
import { DefaultTableBody } from "@cb/components/table/DefaultTableBody";
import { DefaultTableHeader } from "@cb/components/table/DefaultTableHeader";
import { UserAwareTableRow } from "@cb/components/table/UserAwareTableRow";
import { useRoomData } from "@cb/hooks/store";
import { SidebarTabIdentifier } from "@cb/store";
import { DialogTitle } from "@radix-ui/react-dialog";
import { SidebarTabHeader, SidebarTabLayout } from "./SidebarTabLayout";

export const ProblemInfo = () => {
  const { questions } = useRoomData();

  return (
    <SidebarTabLayout forTab={SidebarTabIdentifier.ROOM_QUESTIONS}>
      <SidebarTabHeader>
        <DialogTitle className="text-secondary text-2xl">
          Problem Queue
        </DialogTitle>
      </SidebarTabHeader>
      <DefaultTable loading={questions.length === 0}>
        <DefaultTableHeader headers={["Question", "Difficulty", "Users"]} />
        <DefaultTableBody>
          {questions.map((question) => (
            <UserAwareTableRow key={question.id} question={question} />
          ))}
        </DefaultTableBody>
      </DefaultTable>
    </SidebarTabLayout>
  );
};
