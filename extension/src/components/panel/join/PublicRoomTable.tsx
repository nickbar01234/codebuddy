import React from "react";
import GenericTable from "./GenericTable";
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
  loading: boolean;
}

const PublicRoomTable: React.FC<Props> = ({
  rooms,
  selectedRoomId,
  onSelectRoom,
  loading,
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
      loading={loading}
      renderRow={(room) => (
        <PublicRoomRow
          key={room.id}
          {...room}
          selected={selectedRoomId === room.id}
          onSelect={() => onSelectRoom(room.id)}
        />
      )}
      emptyMessage="No rooms available"
    />
  );
};

export default PublicRoomTable;
