import React from "react";
import { Send } from "lucide-react";

export interface LogEntryProps {
  type: "accepted" | "error" | "join" | "leave" | "normal";
  message: string;
  status?: string;
  italic?: boolean;
}

const LogEntry: React.FC<LogEntryProps> = ({
  type,
  message,
  status,
  italic = false,
}) => {
  const getColorClass = () => {
    switch (type) {
      case "accepted":
        return "text-green-500";
      case "error":
        return "text-red-500";
      case "join":
        return "text-blue-500";
      case "leave":
        return "text-gray-500";
      case "normal":
        return "text-gray-700";
      default:
        return "text-gray-700";
    }
  };

  return (
    <div className="flex items-center space-x-2 py-1">
      <span
        className={`flex-grow ${getColorClass()} ${italic ? "italic" : ""}`}
      >
        {message}
        {status && (
          <span
            className={`ml-2 rounded px-2 py-0.5 text-xs ${
              status === "[Accepted]"
                ? "bg-green-100 text-green-800"
                : status === "[Time Limit Exceeded]"
                  ? "bg-red-100 text-red-800"
                  : ""
            }`}
          >
            {status}
          </span>
        )}
      </span>
      <span className="text-xs text-gray-400">2s</span>
    </div>
  );
};

interface ActivityLogProps {
  logEntries: LogEntryProps[];
}

export const ActivityLogTab: React.FC<ActivityLogProps> = ({ logEntries }) => {
  return (
    <div className="h-full w-full overflow-hidden rounded-lg p-2 shadow-md">
      <div className="h-full w-full">
        {logEntries.map((entry, index) => (
          <LogEntry
            key={index}
            type={entry.type}
            message={entry.message}
            status={entry.status}
            italic={entry.italic}
          />
        ))}
      </div>
      <div className="flex items-center bg-[--color-tab-hover-background] px-4 py-2">
        <input
          type="text"
          placeholder="Enter message..."
          className="flex-grow rounded-l-md border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button className="rounded-r-m">
          <Send className="h-5 w-5 text-blue-600" />
        </button>
      </div>
    </div>
  );
};
