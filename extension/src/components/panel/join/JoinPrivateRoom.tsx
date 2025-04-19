import { baseButtonClassName } from "@cb/components/dialog/RoomDialog";
import { AppState } from "@cb/context/AppStateProvider";
import { useAppState, useRTC } from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import { Input } from "@cb/lib/components/ui/input";
import { Label } from "@cb/lib/components/ui/label";
import { cn } from "@cb/utils/cn";
import { throttle } from "lodash";
import React from "react";

export const JoinPrivateRoom = () => {
  const { joinRoom } = useRTC();
  const { setState: setAppState } = useAppState();
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
    <div className="gap-4 flex flex-col items-center">
      <Label
        htmlFor="roomId"
        className="text-center font-medium text-base text-[#1E1E1E] dark:text-[#FFFFFF]"
      >
        Join a private room
      </Label>
      <div className="flex w-[70%] overflow-hidden rounded-md border border-[#787880] dark:border-[#4A4A4E]">
        <Input
          id="roomId"
          className="rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-[#2A2A2A] px-3 py-2 w-full placeholder:text-gray-400"
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
          className={cn(baseButtonClassName, "rounded-none")}
        >
          Join
        </Button>
      </div>
    </div>
  );
};
