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
  loading: boolean;
}

const PublicRoomTable: React.FC<Props> = ({
  rooms,
  selectedRoomId,
  onSelectRoom,
  headers,
  loading,
}) => {
  return (
    <ScrollArea className="grow h-10 z-10">
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
          {loading ? (
            <TableRow>
              <TableHead
                colSpan={headers.length}
                className="text-center p-4 text-gray-500"
              >
                Loading rooms...
              </TableHead>
            </TableRow>
          ) : rooms.length > 0 ? (
            rooms.map((room) => (
              <PublicRoomRow
                key={room.id}
                {...room}
                selected={selectedRoomId === room.id}
                onSelect={() => onSelectRoom(room.id)}
              />
            ))
          ) : (
            <TableRow>
              <TableHead
                colSpan={headers.length}
                className="text-center p-4 text-gray-500 bg-white dark:bg-dark-layer-bg hover:bg-white dark:hover:bg-dark-layer-bg"
              >
                No rooms available
              </TableHead>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};

export default PublicRoomTable;
