import { baseButtonClassName } from "@cb/components/dialog/RoomDialog";
import { RoomEvent } from "@cb/db/converter";
import { Button } from "@cb/lib/components/ui/button";
import { Input } from "@cb/lib/components/ui/input";
import { cn } from "@cb/utils/cn";
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
    <div className="bg-layer-1 dark:bg-dark-layer-1 flex h-full w-full flex-col rounded-lg p-4 shadow-md flex-1 overflow-x-auto">
      <div className="w-full flex flex-col h-full">
        <div className="hide-scrollbar flex-1 overflow-y-auto p-4 flex flex-col gap-1">
          {roomEvents.map((entry, index) => (
            <LogEntry key={index} entry={entry} />
          ))}
        </div>

        <div className="mb-8 w-full overflow-x-auto overflow-y-hidden">
          <div className="flex w-full h-full p-3 items-center gap-3">
            <Input
              type="message"
              placeholder="Enter message"
              className="w-full h-full rounded-lg border border-[#787880] py-2 cursor-text px-3 placeholder:text-gray-400 dark:border-[#4A4A4E] dark:bg-[#2A2A2A] focus:border-transparent"
            />
            <Button
              type="submit"
              className={cn(
                "hover:bg-[--color-tab-hover-background]",
                baseButtonClassName
              )}
            >
              <Send className="h-5 w-5 text-black dark:text-white" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
