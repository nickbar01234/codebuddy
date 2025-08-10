import { Button } from "@cb/lib/components/ui/button";
import { Input } from "@cb/lib/components/ui/input";
import { Label } from "@cb/lib/components/ui/label";
import { roomStore } from "@cb/store";
import { cn } from "@cb/utils/cn";
import { throttle } from "lodash";
import { CodeIcon } from "lucide-react";
import React from "react";
import { useStore } from "zustand";
import { baseButtonClassName, RoomDialog } from "./RoomDialog";

export const JoinRoomDialog = () => {
  const [inputRoomId, setInputRoomId] = React.useState("");
  const joinRoom = useStore(roomStore, (state) => state.actions.joinRoom);

  const onJoinRoom = React.useMemo(() => {
    return throttle(
      async (
        reactEvent: React.MouseEvent<Element> | React.KeyboardEvent<Element>
      ) => {
        reactEvent.stopPropagation();
        await joinRoom(inputRoomId);
      },
      1000
    );
  }, [joinRoom, inputRoomId]);

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
