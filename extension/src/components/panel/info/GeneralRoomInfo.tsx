import { ColorAwareUserIcon } from "@cb/components/icons";
import { DefaultTable } from "@cb/components/table/DefaultTable";
import { DefaultTableBody } from "@cb/components/table/DefaultTableBody";
import { DefaultTableHeader } from "@cb/components/table/DefaultTableHeader";
import { DefaultTableRow } from "@cb/components/table/DefaultTableRow";
import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { ROOM } from "@cb/constants";
import { useRoomData } from "@cb/hooks/store";
import { DialogTitle } from "@cb/lib/components/ui/dialog";
import { TableCell } from "@cb/lib/components/ui/table";
import { SidebarTabIdentifier } from "@cb/store";
import { CopyIcon, Globe, Users } from "lucide-react";
import { SidebarTabHeader, SidebarTabLayout } from "./SidebarTabLayout";

export const GeneralRoomInfo = () => {
  const { name, id, users } = useRoomData();
  const copyRoomId = useCopyRoomId();

  return (
    <SidebarTabLayout forTab={SidebarTabIdentifier.ROOM_INFO}>
      <SidebarTabHeader>
        <div className="flex flex-col gap-4">
          <SkeletonWrapper loading={name == undefined} className="h-10 w-48">
            <div className="flex gap-2 items-center text-secondary">
              <DialogTitle className="text-2xl">
                {name && name.length > 0 ? name : "Room Information"}
              </DialogTitle>
              <div className="rounded-md bg-quaternary p-2 text-center self-center">
                <Globe />
              </div>
            </div>
          </SkeletonWrapper>
          <SkeletonWrapper loading={id == undefined} className="w-60 h-8">
            <div className="flex gap-1 text-tertiary">
              <span className="text-lg">ID: {id}</span>
              <CopyIcon
                className="cursor-pointer hover:bg-[--color-button-hover-background] dark:hover:bg-[--color-button-hover-background] p-1 hover:rounded-md self-center"
                onClick={copyRoomId}
              />
            </div>
          </SkeletonWrapper>
        </div>
      </SidebarTabHeader>
      <div className="flex flex-col gap-2">
        <div className="flex gap-3 items-center text-secondary">
          <div className="text-xl font-semibold">Members</div>
          <div className="flex items-center rounded-md bg-quaternary p-2 text-sm gap-2">
            <Users />
            <span>
              {users.length} / {ROOM.CAPACITY}
            </span>
          </div>
        </div>
        <DefaultTable loading={users.length === 0}>
          <DefaultTableHeader headers={["Rank", "User", "Problem solved"]} />
          <DefaultTableBody>
            {users.map(({ user, solved, css }, idx) => (
              <DefaultTableRow key={user}>
                <TableCell>{idx}</TableCell>
                <TableCell className="flex gap-2 items-center">
                  <ColorAwareUserIcon css={css} />
                  <span>{user}</span>
                </TableCell>
                <TableCell>{solved}</TableCell>
              </DefaultTableRow>
            ))}
          </DefaultTableBody>
        </DefaultTable>
      </div>
    </SidebarTabLayout>
  );
};
