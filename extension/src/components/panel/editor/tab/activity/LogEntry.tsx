import { LogEvent } from "@cb/db/converter";
import { useAppState } from "@cb/hooks/index";
import { cn } from "@cb/utils/cn";
import { assertUnreachable } from "@cb/utils/error";
import { timeAgo } from "@cb/utils/heartbeat";
import { History, MessageCircleIcon, Users } from "lucide-react";
interface LogEntryProps {
  entry: LogEvent;
}

const colorVariants = {
  green: "text-[#34C759]",
  red: "text-[#FF3B30]",
  orange: "text-[#FF9500]",
  blue: "text-[#007AFF]",
  gray: "text-[#BDBDBD]",
  coral: "text-[#FF6F61]",
  cyan: "text-[#40C4FF]",
  pink: "text-[#FF6586]",
};
const userColors: (keyof typeof colorVariants)[] = [
  "pink",
  "blue",
  "green",
  "orange",
];

export const LogEntry: React.FC<LogEntryProps> = ({ entry }) => {
  const { type, timestamp } = entry;
  // const { peers } = usePeerSelection(); // will use in production. Now use mock data for displaying
  const peers = [{ id: "Buddy" }, { id: "Dev" }, { id: "5bigBooms" }];
  const {
    user: { username },
  } = useAppState();

  const getColorClass = () => {
    switch (type) {
      case "submission": {
        const { status } = entry;
        switch (status) {
          case "success":
            return "green";
          case "error":
            return "red";
          default:
            return assertUnreachable(status);
        }
      }
      case "connection": {
        const { status } = entry;
        switch (status) {
          case "leave":
            return "coral";
          case "join":
            return "cyan";
          default:
            return assertUnreachable(status);
        }
      }
      case "message":
        return "gray";
      default:
        return assertUnreachable(type);
    }
  };

  const color = colorVariants[getColorClass()]; // Get color class based on type and status
  const userColor =
    colorVariants[
      userColors[
        entry.username === username
          ? 0
          : Math.min(
              peers.findIndex((peer) => peer.id === entry.username) + 1,
              userColors.length - 1
            )
      ]
    ];

  const getPrompt = () => {
    const baseClass = " whitespace-nowrap w-full flex items-center gap-1 ";
    switch (type) {
      case "submission":
        return (
          <div className={cn(baseClass, "text-secondary italic")}>
            <History className={cn("inline-block h-4 w-4", color)} />
            <span className="font-bold">{entry.username} </span>
            submitted their code
            <span className={color}>{`[${entry.output}]`}</span>
          </div>
        );

      case "connection":
        return (
          <div className={cn(baseClass, "text-secondary italic")}>
            <Users className={cn("inline-block h-4 w-4", color)} />
            <span className="font-bold">{entry.username} </span>
            {entry.status === "join" ? " joined" : " left"} the room
          </div>
        );
      case "message":
        return (
          <div className={cn(baseClass, "")}>
            <MessageCircleIcon className={cn("inline-block h-4 w-4", color)} />
            <span className={cn("font-bold", userColor)}>
              {entry.username}:
            </span>
            {entry.message}
          </div>
        );
      default:
        return "";
    }
  };

  return (
    <div className="justify-betweenr flex items-center py-1">
      <span className={`w-full`}>{getPrompt()}</span>
      <span className="inline-block w-full flex-grow" />
      <span className="text-tertiary text-xs">{timeAgo(timestamp)}</span>
    </div>
  );
};
