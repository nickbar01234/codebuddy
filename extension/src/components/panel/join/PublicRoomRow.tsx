import { TableCell, TableRow } from "@cb/lib/components/ui/table";
import { cn } from "@cb/utils/cn";
import { formatTime } from "@cb/utils/heartbeat";
import React from "react";
import { Room } from "./PublicRoomTable.tsx";

interface Props extends Room {
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
        "cursor-pointer",
        selected
          ? "bg-black text-white hover:bg-black dark:text-black dark:bg-white dark:hover:bg-white"
          : "hover:bg-gray-200 odd:bg-white even:bg-gray-100 dark:odd:bg-gray-900/50 dark:even:bg-gray-950"
      )}
    >
      <TableCell className="p-2 truncate">{name}</TableCell>
      <TableCell className="p-2 truncate max-w-[140px]">
        {currentProblem}
      </TableCell>
      <TableCell className="p-2 truncate">
        <span
          className={cn(
            "text-xs font-medium",
            difficulty === "Easy" && "text-green-600",
            difficulty === "Medium" && "text-yellow-600",
            difficulty === "Hard" && "text-red-600"
          )}
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
