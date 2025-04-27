import { ScrollArea } from "@cb/lib/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@cb/lib/components/ui/table";
import React from "react";
import PublicRoomRow from "./PublicRoomRow";

interface Room {
  id: string;
  name: string;
  currentProblem: string;
  difficulty: "Easy" | "Medium" | "Hard";
  users: number;
  timeElapsed: number;
}

interface Props {
  rooms: Room[];
  selectedRoomId: string | null;
  onSelectRoom: (id: string) => void;
  headers: string[];
}

const PublicRoomTable: React.FC<Props> = ({
  rooms,
  selectedRoomId,
  onSelectRoom,
  headers,
}) => {
  return (
    // <div className="w-full max-h-[300px] overflow-y-auto">
    <ScrollArea className="grow h-20 max-h-screen z-10">
      <Table className="min-w-full">
        <TableHeader className="sticky top-0 bg-white z-20">
          <TableRow>
            {headers.map((header, index) => (
              <TableHead key={index} className="align-bottom p-2 truncate">
                {header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody className="">
          {rooms.map((room) => (
            <PublicRoomRow
              key={room.id}
              {...room}
              selected={selectedRoomId === room.id}
              onSelect={() => onSelectRoom(room.id)}
            />
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
    // </div>
  );
};

const PublicRoomTable2: React.FC<Props> = ({
  rooms,
  selectedRoomId,
  onSelectRoom,
}) => {
  return (
    // Horizontal + vertical scroll wrapper
    <div className="w-full overflow-x-auto">
      <div className="min-w-full max-h-[300px] overflow-y-auto">
        <table className="min-w-full table-fixed border-collapse">
          <thead className="sticky top-0 bg-white">
            <tr>
              <th className="text-left p-2 ">Room Name</th>
              <th className="text-left p-2 ">Current Problem</th>
              <th className="text-left p-2 ">Difficulty</th>
              <th className="text-left p-2 ">Users</th>
              <th className="text-left p-2 ">Time Elapsed</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <PublicRoomRow
                key={room.id}
                {...room}
                selected={selectedRoomId === room.id}
                onSelect={() => onSelectRoom(room.id)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PublicRoomTable;
