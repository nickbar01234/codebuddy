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
}

const PublicRoomTable: React.FC<Props> = ({
  rooms,
  selectedRoomId,
  onSelectRoom,
}) => {
  return (
    <div className="w-[90%] max-w-2xl overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table className="min-w-full text-sm text-left text-gray-800">
        <thead className="bg-[#F9F9F9] text-gray-500 font-medium">
          <tr>
            <th className="px-4 py-2">Room Name</th>
            <th className="px-4 py-2">Current Problem</th>
            <th className="px-4 py-2">Difficulty</th>
            <th className="px-4 py-2">Users</th>
            <th className="px-4 py-2">Time Elapsed</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
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
  );
};

export default PublicRoomTable;
