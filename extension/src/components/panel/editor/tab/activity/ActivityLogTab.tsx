import { LogEvent } from "@cb/db/converter";
import { useWindowDimensions } from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import { Input } from "@cb/lib/components/ui/input";
import { Send } from "lucide-react";
import React from "react";
import { LogEntry } from "./LogEntry";

interface ActivityLogTabProps {
  logEntries: LogEvent[];
}

export const ActivityLogTab: React.FC<ActivityLogTabProps> = ({
  logEntries,
}) => {
  const {
    height,
    preference: { codePreference },
  } = useWindowDimensions();
  return (
    <div className="bg-layer-1 dark:bg-dark-layer-1 flex h-full w-full flex-col items-center gap-2 overflow-hidden rounded-lg p-4 shadow-md">
      <div
        className="hide-scrollbar flex w-full flex-col gap-1 overflow-y-auto p-4"
        style={{ height: height - codePreference.height - 150 }}
      >
        {logEntries.map((entry, index) => (
          <LogEntry key={index} entry={entry} />
        ))}
      </div>
      <div className="mb-2 flex w-full justify-center items-center gap-2 p-4">
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
