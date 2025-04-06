import { AppState } from "@cb/context/AppStateProvider";
import { useAppState, useRTC } from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cb/lib/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@cb/lib/components/ui/radio-group";
import { throttle } from "lodash";
import React, { useState } from "react";
import { DialogProps } from "./LeaveRoomDialog";

export const CreateRoomOptionDialog = ({ trigger }: DialogProps) => {
  const [visibility, setVisibility] = useState("public");
  const [roomName, setRoomName] = useState("");
  const { createRoom } = useRTC();
  const { setState: setAppState } = useAppState();

  const createRoomThrottled = React.useMemo(() => {
    return throttle((event: React.MouseEvent<Element>) => {
      event.stopPropagation?.();
      setAppState(AppState.ROOM);
      createRoom({
        roomName: roomName,
        isPublic: visibility === "public",
      });
    }, 1000);
  }, [createRoom, setAppState, roomName, visibility]);

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>

      <DialogContent
        className="w-[500px] space-y-4 rounded-xl bg-white p-6 text-lg text-[#1E1E1E] shadow-lg dark:bg-[#1E1E1E] dark:text-[#FFFFFF]"
        onClick={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">
            Create Room
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-1">
          <label className="font-medium text-[#1E1E1E] dark:text-[#FFFFFF]">
            Room Name
          </label>
          <input
            type="text"
            placeholder="Enter Room Name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            className="w-full rounded-md border border-[#787880] bg-white px-3 py-2 text-[#1E1E1E] placeholder:text-gray-400 dark:border-[#4A4A4E] dark:bg-[#2A2A2A] dark:text-[#FFFFFF]"
          />
        </div>

        <RadioGroup
          value={visibility}
          onValueChange={(value) => setVisibility(value)}
          className="space-y-2"
        >
          <p className="font-medium text-[#1E1E1E] dark:text-[#FFFFFF]">
            Visibility
          </p>

          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="public"
              id="public"
              className="form-radio text-[#050404] accent-black dark:text-[#FFFFFF] dark:accent-white"
            />
            <label htmlFor="public" className="space-y-0.5">
              <span>Public</span>
              <p className="text-base text-[#757575] dark:text-[#F1F1F1]">
                Anyone can join your room
              </p>
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <RadioGroupItem
              value="private"
              id="private"
              className="form-radio text-[#1E1E1E] accent-black dark:text-[#FFFFFF] dark:accent-white"
            />
            <label htmlFor="private" className="space-y-0.5">
              <span>Private</span>
              <p className="text-base text-[#757575] dark:text-[#F1F1F1]">
                Only users with the Room ID can access
              </p>
            </label>
          </div>
        </RadioGroup>

        <Button
          onClick={createRoomThrottled}
          className="w-full rounded-md bg-gray-200 py-2 font-medium text-[#1E1E1E] transition hover:bg-[--color-tab-hover-background] dark:bg-[#49494E] dark:text-[#FFFFFF] dark:hover:bg-[--color-tab-hover-background]"
        >
          Create
        </Button>
      </DialogContent>
    </Dialog>
  );
};
