import { TableCell, TableRow } from "@cb/lib/components/ui/table";
import { cn } from "@cb/utils/cn";
import { formatTime } from "@cb/utils/heartbeat";
import React from "react";
import { RoomWithSession } from "./PublicRoomTable";

interface Props extends RoomWithSession {
  selected: boolean;
  onSelect: () => void;
}

const PublicRoomRow: React.FC<Props> = ({
  name,
  currentProblem,
  difficulty,
  users,
  timeElapsed,
  selected,
  onSelect,
}) => {
  return (
    <TableRow
      onClick={onSelect}
      className={cn(
        "cursor-pointer border-none",
        selected
          ? "text-white dark:text-black bg-[#2C2C2C] dark:bg-[#F5F5F5] hover:bg-[#2C2C2C] dark:hover:bg-[#F5F5F5]"
          : "text-primary hover:bg-[#78788033] odd:bg-white even:bg-gray-100 dark:odd:bg-gray-900/50 dark:even:bg-gray-950"
      )}
    >
      <TableCell className="p-2 truncate">{name}</TableCell>
      <TableCell className="p-2 truncate max-w-[140px]">
        {currentProblem}
      </TableCell>
      <TableCell className="p-2 truncate">
        <span
          className={
            difficulty === "Easy"
              ? "text-[#1CBABA]"
              : difficulty === "Medium"
                ? "text-[#FFB700]"
                : "text-[#F63737]"
          }
        >
          {difficulty}
        </span>
      </TableCell>
      <TableCell className="p-2  truncate">{`${users}/4`}</TableCell>
      <TableCell className="p-2  truncate">{formatTime(timeElapsed)}</TableCell>
    </TableRow>
  );
};

export default PublicRoomRow;
