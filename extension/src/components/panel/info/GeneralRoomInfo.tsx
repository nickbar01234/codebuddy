import { DefaultTable } from "@cb/components/table/DefaultTable";
import { DefaultTableBody } from "@cb/components/table/DefaultTableBody";
import { DefaultTableHeader } from "@cb/components/table/DefaultTableHeader";
import { DefaultTableRow } from "@cb/components/table/DefaultTableRow";
import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { ROOM } from "@cb/constants";
import { useAuthUser, usePeers, useRoomData } from "@cb/hooks/store";
import { TableCell } from "@cb/lib/components/ui/table";
import { CopyIcon, Globe, Info, Users } from "lucide-react";
import { BaseInfoSheet } from "./BaseInfoSheet";

export const GeneralRoomInfo = () => {
  const { name, id } = useRoomData();
  const { peers } = usePeers();
  const { username } = useAuthUser();
  const copyRoomId = useCopyRoomId();
  const users = [...Object.keys(peers), username];

  return (
    <BaseInfoSheet trigger={<Info />}>
      <div className="flex flex-col gap-4 mb-8">
        <SkeletonWrapper loading={name == undefined} className="h-10 w-48">
          <div className="flex gap-2 items-center text-secondary">
            <h2 className="text-2xl">
              {name && name.length > 0 ? name : "Room Information"}
            </h2>
            <div className="rounded-md bg-quaternary p-2 text-center self-center">
              <Globe />
            </div>
          </div>
        </SkeletonWrapper>
        <SkeletonWrapper loading={id == undefined} className="w-60 h-8">
          <div className="flex gap-2 text-tertiary">
            <span className="text-lg">ID: {id}</span>
            <CopyIcon
              className="cursor-pointer hover:bg-[--color-button-hover-background] dark:hover:bg-[--color-button-hover-background]"
              onClick={copyRoomId}
            />
          </div>
        </SkeletonWrapper>
      </div>
      <div className="mb-2 flex gap-3 items-center text-secondary">
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
          {users.map((user, idx) => (
            <DefaultTableRow key={user}>
              <TableCell>{idx}</TableCell>
              <TableCell>{user}</TableCell>
              <TableCell>0</TableCell>
            </DefaultTableRow>
          ))}
        </DefaultTableBody>
      </DefaultTable>
    </BaseInfoSheet>
  );
};
