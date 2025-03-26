import {
  useActivity,
  useAppState,
  usePeerSelection,
  useWindowDimensions,
} from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import { Input } from "@cb/lib/components/ui/input";
import { Activity, Send } from "lucide-react";
import React, { useEffect } from "react";
import { LogEntry } from "./LogEntry";

export const ActivityLogTab: React.FC = () => {
  const {
    height,
    preference: { codePreference },
  } = useWindowDimensions();
  const [messageValue, setMessage] = React.useState("");
  const { activities, sendActivity } = useActivity();
  const { isBuffer } = usePeerSelection();
  const {
    user: { username },
  } = useAppState();
  const scroll = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scroll.current) {
      scroll.current.scrollTo({
        top: scroll.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [activities, isBuffer]);

  const onSubmit = React.useCallback(() => {
    const userColorKeys = Object.keys(userColors);
    const randomColor =
      userColors[
        userColorKeys[
          Math.floor(Math.random() * userColorKeys.length)
        ] as keyof typeof userColors
      ];
    sendActivity({
      type: "message",
      payload: {
        username: username,
        message: messageValue,
        color: randomColor,
      },
    });
    setMessage("");
  }, [messageValue, sendActivity, username]);

  return (
    <div className="bg-layer-1 dark:bg-dark-layer-1 flex h-full w-full flex-col items-center gap-2 overflow-hidden rounded-lg p-4 shadow-md">
      <div className="flex w-full items-start gap-1">
        <Activity className="h-4 w-4 text-green-500" />
        Activity Log
      </div>
      <div
        className="hide-scrollbar flex w-full flex-col gap-1 overflow-y-auto p-4"
        style={{ height: height - codePreference.height - 150 }}
        ref={scroll}
      >
        {activities.map((entry, index) => (
          <LogEntry key={index} entry={entry} />
        ))}
      </div>
      <div className="mb-1 flex w-full items-center gap-2 p-4">
        <Input
          type="text"
          placeholder="Enter message"
          value={messageValue}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && messageValue.trim() !== "") {
              onSubmit();
            }
          }}
        />
        <Button
          type="submit"
          className="hover:bg-[--color-tab-hover-background]"
          onClick={onSubmit}
        >
          <Send className="h-5 w-5 text-black dark:text-white" />
        </Button>
      </div>
    </div>
  );
};
const userColors = {
  Buddy: "text-red-500",
  Code: "text-blue-500",
  Dev: "text-green-500",
  "5bigBooms": "text-yellow-500",
};
