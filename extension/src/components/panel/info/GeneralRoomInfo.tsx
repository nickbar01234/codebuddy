import { DefaultTable } from "@cb/components/table/DefaultTable";
import { DefaultTableBody } from "@cb/components/table/DefaultTableBody";
import { DefaultTableHeader } from "@cb/components/table/DefaultTableHeader";
import { DefaultTableRow } from "@cb/components/table/DefaultTableRow";
import { useAuthUser, usePeers } from "@cb/hooks/store";
import { TableCell } from "@cb/lib/components/ui/table";
import { Info } from "lucide-react";
import { BaseInfoSheet } from "./BaseInfoSheet";

export const GeneralRoomInfo = () => {
  const { peers } = usePeers();
  const { username } = useAuthUser();
  const users = [...Object.keys(peers), username];

  return (
    <BaseInfoSheet trigger={<Info />}>
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
