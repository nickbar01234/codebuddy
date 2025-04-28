import React from "react";
import GenericTable from "./GenericTable";
import PublicRoomRow from "./PublicRoomRow";

export interface Room {
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
    <GenericTable
      data={rooms}
      headers={[
        "Room Name",
        "Current Problem",
        "Difficulty",
        "Users",
        "Time Elapsed",
      ]}
      renderRow={(room) => (
        <PublicRoomRow
          key={room.id}
          {...room}
          selected={selectedRoomId === room.id}
          onSelect={() => onSelectRoom(room.id)}
        />
      )}
    />
  );
};

export default PublicRoomTable;
