import {
  baseButtonClassName,
  RoomDialog,
} from "@cb/components/dialog/RoomDialog";
import { AppState } from "@cb/context/AppStateProvider";
import { useAppState, useRTC } from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import { Input } from "@cb/lib/components/ui/input";
import { Label } from "@cb/lib/components/ui/label";
import { cn } from "@cb/utils/cn";
import { throttle } from "lodash";
import { CodeIcon } from "lucide-react";
import React from "react";

export const JoinRoomButton = () => {
  const { setState: setAppState } = useAppState();

  return (
    <RoomDialog
      title={{ node: "Join Room" }}
      trigger={{
        label: "Join Room",
        // customTrigger: true, // Use a custom trigger
        node: (
          // <button
          //   onClick={() => setAppState(AppState.JOIN_ROOMS)} // Navigate to public rooms
          //   className={cn(baseButtonClassName, "w-full")}
          //   aria-label="Join Room"
          // >
          <>
            <CodeIcon />
            <span>Join Room</span>
          </>
        ),
        props: {
          onClick: () => setAppState(AppState.JOIN_ROOMS),
        },
      }}
      content={{
        props: {
          className:
            "w-[500px] [&>button]:hidden gap-y-4 rounded-xl bg-white p-6 text-lg text-[#1E1E1E] dark:bg-[#262626] shadow-lg dark:text-[#FFFFFF]",
          onClick: (e) => e.stopPropagation(),
        },
      }}
    ></RoomDialog>
  );
  const { joinRoom } = useRTC();
  const [inputRoomId, setInputRoomId] = React.useState("");

  const onJoinRoom = React.useMemo(() => {
    return throttle(
      async (
        reactEvent: React.MouseEvent<Element> | React.KeyboardEvent<Element>
      ) => {
        reactEvent.stopPropagation();
        const haveJoined = await joinRoom(inputRoomId);
        if (haveJoined) {
          setAppState(AppState.ROOM);
        }
      },
      1000
    );
  }, [joinRoom, inputRoomId, setAppState]);

  const onChangeRoomIdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setInputRoomId(e.target.value);
  };

  return (
    <RoomDialog
      trigger={{
        label: "Join Room",
        node: (
          <>
            <CodeIcon />
            <span>Join Room</span>
          </>
        ),
      }}
      title={{ node: "Join room" }}
      content={{
        props: {
          onClick: (e) => e.stopPropagation(),
          className:
            "w-[500px] [&>button]:hidden gap-y-4 rounded-xl bg-white p-6 text-lg text-[#1E1E1E] dark:bg-[#262626] shadow-lg dark:text-[#FFFFFF]",
        },
      }}
    >
      <div className="gap-4 flex flex-col">
        <Label
          htmlFor="roomId"
          className="font-medium text-base text-[#1E1E1E] dark:text-[#FFFFFF]"
        >
          Input Room ID
        </Label>
        <Input
          id="roomId"
          className="w-full rounded-lg border border-[#787880] py-2 cursor-text px-3 placeholder:text-gray-400 dark:border-[#4A4A4E] dark:bg-[#2A2A2A] focus:border-transparent"
          placeholder="Enter room ID"
          onChange={onChangeRoomIdInput}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onJoinRoom(e);
            }
          }}
        />
        <Button
          onClick={onJoinRoom}
          className={cn(baseButtonClassName, "w-full")}
        >
          Join
        </Button>
      </div>
    </RoomDialog>
  );
};
