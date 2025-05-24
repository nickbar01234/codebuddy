import React, { useEffect, useState } from "react";
import GenericTable from "./GenericTable";
import PublicRoomRow from "./PublicRoomRow";
// import { sampleRooms } from "./sampleRooms.ts";
import { getPublicRoomsCollection } from "@cb/db";
import { Room } from "@cb/db/converter";
import usePaginate from "@cb/hooks/usePaginate";

export interface RoomWithSession {
  id: string;
  name: string;
  currentProblem: string;
  difficulty: "Easy" | "Medium" | "Hard";
  users: number;
  timeElapsed: number;
}

interface Props {
  selectedRoomId: string | null;
  onSelectRoom: (id: string) => void;
}

const PublicRoomTable: React.FC<Props> = ({ selectedRoomId, onSelectRoom }) => {
  const roomsQuery = getPublicRoomsCollection();
  console.log("Rooms query:", roomsQuery);

  const { data, loading, getNext, hasNext } = usePaginate<Room>({
    baseQuery: roomsQuery,
    hookLimit: 10,
  });

  console.log("Paginate data:", data.docs);
  console.log("Loading state:", loading);
  console.log("Has next page:", hasNext);

  const [publicRooms, setPublicRooms] = useState<RoomWithSession[]>([]);

  useEffect(() => {
    const fetchRoomsWithSessions = async () => {
      try {
        console.log("Fetching rooms with sessions...");
        const roomsWithSession = await Promise.all(
          data.docs.map(async (doc) => {
            const room = doc.data();
            return {
              id: doc.id,
              name: room.roomName,
              currentProblem: "N/A",
              difficulty: "Easy" as "Easy" | "Medium" | "Hard",
              users: room.usernames.length,
              timeElapsed: 0,
            };
          })
        );
        setPublicRooms(roomsWithSession);
      } catch (error) {
        console.error("Error fetching rooms:", error);
      }
    };

    if (data.docs.length > 0) {
      fetchRoomsWithSessions();
    }
  }, [data]);

  return (
    <GenericTable
      data={publicRooms}
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
      isLoading={loading}
      hasMore={hasNext}
      loadMore={getNext}
    />
  );
};

export default PublicRoomTable;
