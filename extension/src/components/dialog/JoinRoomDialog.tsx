import { AppState } from "@cb/context/AppStateProvider";
import { useAppState, useRTC } from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import { Input } from "@cb/lib/components/ui/input";
import { cn } from "@cb/utils/cn";
import { throttle } from "lodash";
import { CodeIcon } from "lucide-react";
import React from "react";
import { baseButtonClassName, RoomDialog } from "./RoomDialog";

export const JoinRoomDialog = () => {
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
    <RoomDialog
      trigger={
        <Button
          className="flex items-center justify-center w-[150px] hover:bg-[--color-button-hover-background] bg-[--color-button-background]"
          variant="secondary"
          aria-label="Create a new room"
        >
          <CodeIcon />
          <span className="text-base">Join Room</span>
        </Button>
      }
      onContentClick={(e) => e.stopPropagation()}
      contentClassName="w-[500px] [&>button]:hidden space-y-3 rounded-xl bg-white p-6 text-lg text-[#1E1E1E] dark:bg-[#262626] shadow-lg dark:text-[#FFFFFF]"
      title="Join Room"
      description="Input room ID"
    >
      <Input
        className="bg-fill-3 dark:bg-dark-fill-3 w-full cursor-text rounded-lg border border-transparent px-3 py-[5px]"
        placeholder="Enter room ID"
        onChange={onChangeRoomIdInput}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onJoinRoom(e);
          }
        }}
      />

      {/* user on ipad like me cannot hit enter to join the room so we need to have a button*/}
      <Button
        onClick={onJoinRoom}
        className={cn(baseButtonClassName, "w-full")}
      >
        Join
      </Button>
    </RoomDialog>
  );
};
