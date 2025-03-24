import { LogEvent } from "@cb/db/converter";
import { Send } from "lucide-react";
import React from "react";
import { LogEntry } from "./LogEntry";
import { Input } from "@cb/lib/components/ui/input";
import { Button } from "@cb/lib/components/ui/button";
import { useWindowDimensions } from "@cb/hooks/index";

interface ActivityLogProps {
  logEntries: LogEvent[];
}

export const ActivityLogTab: React.FC<ActivityLogProps> = ({ logEntries }) => {
  const { height } = useWindowDimensions();
  return (
    <div className="flex h-full w-full flex-col items-center gap-2 overflow-hidden rounded-lg p-2 shadow-md">
      <div
        className="flex w-full flex-col gap-2 overflow-y-auto p-2"
        style={{ height: height - 128 }}
      >
        {logEntries.map((entry, index) => (
          <LogEntry key={index} entry={entry} />
        ))}
      </div>
      <div className="item flex w-full items-center space-x-2 bg-[--color-tab-hover-background] p-2">
        <Input type="message" placeholder="Enter message" />
        <Button type="submit">
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};
