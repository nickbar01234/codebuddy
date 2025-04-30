import { useOnMount } from "@cb/hooks/index";
import React, { useState } from "react";
import GenericTable from "./GenericTable";
import PublicRoomRow from "./PublicRoomRow";
import { sampleRooms } from "./sampleRooms.ts";

export interface Room {
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
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1); // Track the current page

  useOnMount(() => {
    // Simulate loading delay for 1 second
    const timeout = setTimeout(() => {
      setPublicRooms(sampleRooms.slice(0, 10));
    }, 1000);

    return () => clearTimeout(timeout);
  });

  const loadMore = () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setTimeout(() => {
      const nextPage = currentPage + 1;
      const nextRows = sampleRooms.slice((nextPage - 1) * 10, nextPage * 10);

      setPublicRooms((prevRooms) => [...prevRooms, ...nextRows]);

      // Check if there are more rows to load
      // if (nextPage * 10 >= sampleRooms.length) {
      //   setHasMore(false);
      // }

      setCurrentPage(nextPage);
      setIsLoading(false);
    }, 1000);
  };

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
      isLoading
      hasMore
      loadMore={loadMore}
    />
  );
};

export default PublicRoomTable;
