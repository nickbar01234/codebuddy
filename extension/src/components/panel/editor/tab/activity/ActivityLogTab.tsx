import { LogEvent } from "@cb/db/converter";
import { Send } from "lucide-react";
import React from "react";
import { LogEntry } from "./LogEntry";

interface ActivityLogProps {
  logEntries: LogEvent[];
}

export const ActivityLogTab: React.FC<ActivityLogProps> = ({ logEntries }) => {
  return (
    <div className="h-full w-full overflow-hidden rounded-lg p-2 shadow-md">
      <div className="h-full w-full">
        {logEntries.map((entry, index) => (
          <LogEntry key={index} entry={entry} />
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
