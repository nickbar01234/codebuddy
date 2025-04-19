import { cn } from "@cb/utils/cn";
import { formatTime } from "@cb/utils/heartbeat";
import React from "react";

interface Props {
  id: string;
  name: string;
  currentProblem: string;
  difficulty: "Easy" | "Medium" | "Hard";
  users: number;
  timeElapsed: number;
  selected: boolean;
  onSelect: () => void;
}

const PublicRoomRow: React.FC<Props> = ({
  id,
  name,
  currentProblem,
  difficulty,
  users,
  timeElapsed,
  selected,
  onSelect,
}) => {
  return (
    <tr
      onClick={onSelect}
      className={cn(
        "cursor-pointer transition-colors",
        selected
          ? "bg-gray-100 border-l-4 border-[#D92D20]"
          : "hover:bg-gray-50"
      )}
    >
      <td className="px-4 py-2">{name}</td>
      <td className="px-4 py-2 truncate max-w-[140px]">{currentProblem}</td>
      <td className="px-4 py-2">
        <span
          className={cn(
            "rounded px-2 py-0.5 text-xs font-medium",
            difficulty === "Easy" && "text-green-600 bg-green-50",
            difficulty === "Medium" && "text-yellow-700 bg-yellow-50",
            difficulty === "Hard" && "text-red-600 bg-red-50"
          )}
        >
          {difficulty}
        </span>
      </td>
      <td className="px-4 py-2">{`${users}/4`}</td>
      <td className="px-4 py-2">{formatTime(timeElapsed)}</td>
    </tr>
  );
};

export default PublicRoomRow;
