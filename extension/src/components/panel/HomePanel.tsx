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
    <div className="hide-scrollbar flex h-full w-full flex-col gap-10 overflow-x-auto justify-center mr-4">
      <div className="flex min-w-max flex-col items-center justify-end gap-3">
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

      <div className="flex min-w-max flex-col items-center gap-3">
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
            className="w-[500px] space-y-3 rounded-xl bg-white p-6 text-lg text-[#1E1E1E] dark:bg-[#262626] shadow-lg dark:text-[#FFFFFF]"
            onClick={(e) => e.stopPropagation()}
          >
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold">
                Create Room
              </DialogTitle>
            </DialogHeader>

            <div className="flex flex-col gap-y-2">
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
            </div>

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
                    className="form-radio accent-black dark:accent-white self-center"
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
                    className="form-radio accent-black dark:accent-white self-center"
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
              className="w-full rounded-md  py-2 font-medium text-base transition text-[#1E1E1E] dark:text-[#FFFFFF] hover:bg-[--color-button-hover-background] bg-[--color-button-background] dark:hover:bg-[--color-button-hover-background] dark:bg-[--color-button-background]"
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
