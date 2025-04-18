import { AppState } from "@cb/context/AppStateProvider";
import { useAppState, useRTC } from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import { Input } from "@cb/lib/components/ui/input";
import { Label } from "@cb/lib/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@cb/lib/components/ui/radio-group";
import { cn } from "@cb/utils/cn";
import { throttle } from "lodash";
import { PlusIcon } from "lucide-react";
import React from "react";
import { RoomDialog, baseButtonClassName } from "./RoomDialog";

export const CreateRoomDialog = () => {
  const { createRoom } = useRTC();
  const { setState: setAppState } = useAppState();
  const [isPublic, setIsPublic] = React.useState(true);
  const [roomName, setRoomName] = React.useState("");

  const createRoomThrottled = React.useMemo(() => {
    return throttle((event: React.MouseEvent<Element>) => {
      event.stopPropagation?.();
      if (isPublic && roomName.trim() === "") {
        alert("Public rooms must have a name.");
        return;
      }
      setAppState(AppState.ROOM);
      createRoom({
        roomName: roomName,
        isPublic: isPublic,
      });
    }, 1000);
  }, [createRoom, setAppState, roomName, isPublic]);

  return (
    <RoomDialog
      title={{ node: "Create Room" }}
      trigger={{
        label: "Create Room",
        node: (
          <div className="flex">
            <PlusIcon />
            <span className="text-base">Create Room</span>
          </div>
        ),
      }}
      description={{
        node: "Please type the room name and select the visibility to create a room",
      }}
      content={{
        props: {
          className:
            "w-[500px] [&>button]:hidden space-y-3 rounded-xl bg-white p-6 text-lg text-[#1E1E1E] dark:bg-[#262626] shadow-lg dark:text-[#FFFFFF]",
          onClick: (e) => e.stopPropagation(),
        },
      }}
    >
      <div className="flex flex-col gap-4">
        <Label
          htmlFor="roomName"
          className="font-medium text-base text-[#1E1E1E] dark:text-[#FFFFFF]"
        >
          Room Name
        </Label>
        <Input
          id="roomName"
          type="text"
          placeholder="Enter Room Name"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="w-full border border-[#787880] px-3 py-2 placeholder:text-gray-400 dark:border-[#4A4A4E] dark:bg-[#2A2A2A] focus:border-transparent"
        />
        <RadioGroup
          value={isPublic ? "public" : "private"}
          onValueChange={(value) => setIsPublic(value === "public")}
          className="space-y-1"
        >
          <p className="font-medium ">Visibility</p>

          <div className="flex flex-col gap-y-1">
            <div className="grid grid-cols-[5%_95%]">
              <RadioGroupItem
                value="public"
                id="public"
                className="form-radio self-center border-[#1E1E1E] dark:border-white text-[#1E1E1E] dark:text-white"
              />
              <label htmlFor="public">
                <span>Public</span>
              </label>
            </div>
            <div className="grid grid-cols-[5%_95%]">
              <div />
              <p className="text-base text-[#757575] dark:text-[#F1F1F1]">
                Anyone can join your room
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-y-1">
            <div className="grid grid-cols-[5%_95%]">
              <RadioGroupItem
                value="private"
                id="private"
                className="form-radio self-center border-[#1E1E1E] dark:border-white text-[#1E1E1E] dark:text-white"
              />
              <label htmlFor="private">
                <span>Private</span>
              </label>
            </div>
            <div className="grid grid-cols-[5%_95%]">
              <div />
              <p className="text-base text-[#757575] dark:text-[#F1F1F1]">
                Only users with the Room ID can access
              </p>
            </div>
          </div>
        </RadioGroup>

        <Button
          onClick={createRoomThrottled}
          className={cn(baseButtonClassName, "w-full")}
        >
          Create
        </Button>
      </div>
    </RoomDialog>
  );
};
