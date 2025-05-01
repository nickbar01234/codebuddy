import { RoomEvent } from "@cb/db/converter";
import { Button } from "@cb/lib/components/ui/button";
import { Input } from "@cb/lib/components/ui/input";
import { Send } from "lucide-react";
import React from "react";
import { LogEntry } from "./LogEntry";

interface ActivityLogTabProps {
  roomEvents: RoomEvent[];
}

export const ActivityLogTab: React.FC<ActivityLogTabProps> = ({
  roomEvents,
}) => {
  return (
    <div className="bg-layer-1 dark:bg-dark-layer-1 flex h-full w-full flex-col rounded-lg p-4 shadow-md overflow-hidden">
      <div className="flex-1 w-full overflow-x-auto">
        <div className="min-w-max flex flex-col h-full">
          <div className="hide-scrollbar flex-1 overflow-y-auto p-4 flex flex-col gap-1">
            {roomEvents.map((entry, index) => (
              <LogEntry key={index} entry={entry} />
            ))}
          </div>

          <div className="mb-2 w-full overflow-x-auto overflow-y-hidden">
            <div className="flex min-w-max items-center">
              <Input type="message" placeholder="Enter message" />
              <Button
                type="submit"
                className="hover:bg-[--color-tab-hover-background]"
              >
                <Send className="h-5 w-5 text-black dark:text-white" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
