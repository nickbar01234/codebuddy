import { CodeIcon, PlusIcon } from "@cb/components/icons";
import { ThemeAwaredLogo } from "@cb/components/icons/Logo";
import { AppState, appStateContext } from "@cb/context/AppStateProvider";
import { useRTC } from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@cb/lib/components/ui/dialog";
import { Input } from "@cb/lib/components/ui/input";
import { Label } from "@cb/lib/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@cb/lib/components/ui/radio-group";
import { throttle } from "lodash";
import React from "react";

const HomePanel = () => {
  const { joinRoom, createRoom } = useRTC();
  const { setState: setAppState } = React.useContext(appStateContext);
  const [inputRoomId, setInputRoomId] = React.useState("");
  const [visibility, setVisibility] = React.useState("public");
  const [roomName, setRoomName] = React.useState("");

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
    <div className="hide-scrollbar flex h-full w-full flex-col gap-10 overflow-scroll justify-center">
      <div className="flex w-full flex-col items-center justify-end gap-3">
        <ThemeAwaredLogo
          containerProps={{
            className:
              "aspect-square md:h-[140px] sm:h-[100px] md:w-[140px] sm:w-[100px]",
          }}
        />
        <h1 className="text-2xl">
          Code<span className="text-pinkish-red">Buddy</span>
        </h1>
      </div>

      <div className="flex w-full flex-col items-center gap-3">
        <Dialog>
          <DialogTrigger>
            <Button
              className="flex items-center justify-center w-[150px] hover:bg-[--color-button-hover-background] bg-[--color-button-background] dark:hover:bg-[--color-button-hover-background] dark:bg-[--color-button-background]"
              variant="secondary"
              aria-label="Create a new room"
            >
              <PlusIcon />
              <span className="text-base">Create Room</span>
            </Button>
          </DialogTrigger>

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
              <Label
                htmlFor="roomName"
                className="font-medium text-[#1E1E1E] dark:text-[#FFFFFF]"
              >
                Room Name
              </Label>
              <Input
                id="roomName"
                type="text"
                placeholder="Enter Room Name"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full border border-[#787880] px-3 py-2 text-[#1E1E1E] placeholder:text-gray-400 dark:border-[#4A4A4E] dark:bg-[#2A2A2A] dark:text-[#FFFFFF] focus:border-transparent
"
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

        <Dialog>
          <DialogTrigger>
            <Button
              className="flex items-center justify-center w-[150px] hover:bg-[--color-button-hover-background] bg-[--color-button-background] dark:hover:bg-[--color-button-hover-background] dark:bg-[--color-button-background]"
              variant="secondary"
              aria-label="Create a new room"
            >
              <CodeIcon />
              <span className="text-base">Join Room</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="[&>button]:hidden">
            <DialogHeader className="text-2xl">
              <DialogTitle>Input Room ID</DialogTitle>
            </DialogHeader>
            <DialogDescription className="hidden">
              Input room ID
            </DialogDescription>
            <input
              className="bg-fill-3 dark:bg-dark-fill-3 w-full cursor-text rounded-lg border border-transparent px-3 py-[5px]"
              placeholder="Enter room ID"
              onChange={onChangeRoomIdInput}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  onJoinRoom(e);
                }
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default HomePanel;
