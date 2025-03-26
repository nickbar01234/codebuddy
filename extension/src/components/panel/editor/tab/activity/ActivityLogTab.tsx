import { LogEvent } from "@cb/db/converter";
import {
  useActivity,
  useAppState,
  useOnMount,
  usePeerSelection,
  useWindowDimensions,
} from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import { Input } from "@cb/lib/components/ui/input";
import { Timestamp } from "firebase/firestore";
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

const dummy: LogEvent[] = [
  {
    type: "submission",
    payload: {
      username: "Buddy",
      output: "Accepted",
      status: "success",
    },
    timestamp: Timestamp.fromDate(
      new Date(Date.now() - Math.floor(Math.random() * 10))
    ), // Random timestamp
  },
  {
    type: "submission",
    payload: {
      username: "Code",
      output: "Time limit exceeded",
      status: "error",
    },
    timestamp: Timestamp.fromDate(
      new Date(Date.now() - Math.floor(Math.random() * 4000))
    ), // Random timestamp
  },
  {
    type: "connection",
    payload: {
      username: "Dev",
      status: "join",
    },
    timestamp: Timestamp.fromDate(
      new Date(Date.now() - Math.floor(Math.random() * 110))
    ), // Random timestamp
  },
  {
    type: "message",
    payload: {
      username: "Code",
      message: "RAHHHhHHH can someone take a look at my code",
      color: userColors["Code"], // Assigning color for Code
    },
    timestamp: Timestamp.fromDate(
      new Date(Date.now() - Math.floor(Math.random() * 3130))
    ), // Random timestamp
  },
  {
    type: "message",
    payload: {
      username: "Buddy",
      message: "um no sry",
      color: userColors["Buddy"], // Assigning color for Buddy
    },
    timestamp: Timestamp.fromDate(
      new Date(Date.now() - Math.floor(Math.random() * 13470))
    ), // Random timestamp
  },
  {
    type: "connection",
    payload: {
      username: "Buddy",
      status: "leave",
    },
    timestamp: Timestamp.fromDate(
      new Date(Date.now() - Math.floor(Math.random() * 1220))
    ), // Random timestamp
  },
  {
    type: "message",
    payload: {
      username: "Code",
      message: "???",
      color: userColors["Code"], // Assigning color for Code
    },
    timestamp: Timestamp.fromDate(
      new Date(Date.now() - Math.floor(Math.random() * 1234109))
    ), // Random timestamp
  },
  {
    type: "message",
    payload: {
      username: "Dev",
      message: "lmao",
      color: userColors["Dev"], // Assigning color for Dev
    },
    timestamp: Timestamp.fromDate(
      new Date(Date.now() - Math.floor(Math.random() * 223410))
    ), // Random timestamp
  },
  {
    type: "message",
    payload: {
      username: "5bigBooms",
      message: "lmao",
      color: userColors["5bigBooms"], // Assigning color for 5bigBooms
    },
    timestamp: Timestamp.fromDate(
      new Date(Date.now() - Math.floor(Math.random() * 232410))
    ), // Random timestamp
  },
];
