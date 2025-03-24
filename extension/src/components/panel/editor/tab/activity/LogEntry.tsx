import { LogEvent } from "@cb/db/converter";
import { cn } from "@cb/utils/cn";
import { LeaveIcon } from "@cb/components/icons";
import { History, MessageCircleIcon, Users } from "lucide-react";
import { getUnixTs } from "@cb/utils/heartbeat";

interface LogEntryProps {
  entry: LogEvent;
}

export const LogEntry: React.FC<LogEntryProps> = ({ entry }) => {
  const { type, payload, timestamp } = entry;
  const getColorClass = () => {
    switch (type) {
      case "submission":
        switch (payload.status) {
          case "success":
            return "text-green-500";
          case "error":
            return "text-red-500";
        }
        break;
      case "connection":
        switch (payload.status) {
          case "leave":
            return "text-orange-500";
          case "join":
            return "text-cyan-500";
        }
        break;
      case "message":
        return "text-gray-500";
      default:
        return "text-gray-500";
    }
  };
  const color = getColorClass();
  const getPrompt = () => {
    switch (type) {
      case "submission":
        return (
          <div className="flex items-center gap-1 italic text-gray-700 dark:text-gray-400">
            <History className={cn("inline-block h-4 w-4", color)} />
            <span className="font-bold">{payload.username} </span>
            submitted their code
            <span className={color}>{`[${payload.output}]`}</span>
          </div>
        );

      case "connection":
        return (
          <div className="flex items-center gap-1 italic text-gray-700 dark:text-gray-400">
            <Users className={cn("inline-block h-4 w-4", color)} />
            <span className="font-bold">{payload.username} </span>
            {payload.status === "join" ? " joined" : " left"} the room
          </div>
        );
      case "message":
        return (
          <div className="flex items-center gap-1">
            <MessageCircleIcon className={cn("inline-block h-4 w-4", color)} />
            <span className={cn("font-bold", payload.color)}>
              {payload.username}:
            </span>
            {payload.message}
          </div>
        );
      default:
        return "";
    }
  };

  return (
    <div className="flex items-center space-x-2 py-1">
      <span className={`flex-grow`}>{getPrompt()}</span>
      <span className="text-xs text-gray-400">{2}s</span>
    </div>
  );
};
