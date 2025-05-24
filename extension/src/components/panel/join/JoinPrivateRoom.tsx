import { AppState } from "@cb/context/AppStateProvider";
import { useAppState, useRTC } from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import { Input } from "@cb/lib/components/ui/input";
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
      <h2 className="text-xl font-medium text-center">Join a private room</h2>
      <div className="flex w-[70%] rounded-md border border-[#78788033] dark:border-[#4A4A4E] overflow-hidden">
        <Input
          id="roomId"
          className="text-secondary rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 dark:bg-[#2A2A2A]"
          placeholder="Enter room ID"
          onChange={onChangeRoomIdInput}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onJoinRoom(e);
            }
          }}
        />
        <Button
          variant={"secondary"}
          onClick={onJoinRoom}
          className="bg-[#78788033] rounded-none dark:text-white transition hover:bg-[--color-button-hover-background] dark:bg-[#71717A] dark:hover:bg-[--color-button-hover-background]"
        >
          Join
        </Button>
      </div>
    </div>
  );
};
