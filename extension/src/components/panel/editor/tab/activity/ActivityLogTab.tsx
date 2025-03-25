import { LogEvent } from "@cb/db/converter";
import { Send } from "lucide-react";
import React from "react";
import { LogEntry } from "./LogEntry";
import { Input } from "@cb/lib/components/ui/input";
import { Button } from "@cb/lib/components/ui/button";
import { useWindowDimensions } from "@cb/hooks/index";
import { Activity } from "lucide-react";

interface ActivityLogProps {
  logEntries: LogEvent[];
}

export const ActivityLogTab: React.FC<ActivityLogProps> = ({ logEntries }) => {
  const {
    height,
    preference: { codePreference },
  } = useWindowDimensions();
  return (
    <div className="bg-layer-1 dark:bg-dark-layer-1 flex h-full w-full flex-col items-center gap-2 overflow-hidden rounded-lg p-2 shadow-md">
      <div className="flex w-full items-start gap-2">
        <Activity className="h-4 w-4 text-green-500" />
        Activity Log
      </div>
      <div
        className="hide-scrollbar flex w-full flex-col gap-2 overflow-y-auto p-2"
        style={{ height: height - codePreference.height - 150 }}
      >
        {logEntries.map((entry, index) => (
          <LogEntry key={index} entry={entry} />
        ))}
      </div>
      <div className="mb-2 flex w-full items-center space-x-2 p-1">
        <Input type="message" placeholder="Enter message" />
        <Button
          type="submit"
          className="hover:bg-[--color-tab-hover-background]"
        >
          <Send className="h-5 w-5 text-black dark:text-white" />
        </Button>
      </div>
    </div>
  );
};
