import { LeaveRoomDialog } from "@cb/components/dialog/LeaveRoomDialog";
import { LeaveIcon } from "@cb/components/icons";
import { Ripple } from "@cb/components/panel/Ripple";
import { useRTC } from "@cb/hooks/index";
import { CopyIcon } from "lucide-react";

const CreateRoomLoadingPanel = () => {
  const { roomId } = useRTC();

  return (
    <div className="flex h-full w-full flex-col relative items-center p-4">
      <div className="left-7 top-5 absolute self-start">
        <LeaveRoomDialog
          trigger={
            <button className="relative z-10 flex w-40 cursor-pointer items-center justify-center gap-3 rounded-lg border border-gray-400 px-4 py-2 hover:bg-[--color-tab-hover-background] dark:border-gray-600">
              <LeaveIcon />
              <span className="text-base font-medium">Leave Room</span>
            </button>
          }
        />
      </div>

      <div className="relative z-20 h-full w-full justify-center flex flex-col gap-1 items-center text-center">
        <span className="text-2xl font-bold text-[#1E1E1E] dark:text-[#F1F1F1B2]">
          Room created successfully!
        </span>
        <span className="text-lg text-[#757575] dark:text-gray-400">
          Others can now join your room using the Room ID below
        </span>
        <div className=" flex w-full max-w-sm flex-col items-center">
          <div className="flex w-full items-center overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
            <span className="w-full truncate px-4 py-3 font-mono text-lg text-[#1E1E1E] dark:text-[#F1F1F1B2]">
              {roomId ?? "Fetching Room ID..."}
            </span>
            <button
              type="button"
              aria-label="Copy room ID"
              className="flex h-full w-12 items-center justify-center bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(roomId ?? "");
              }}
            >
              <CopyIcon className="h-6 w-6 cursor-pointer text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 h-full w-full z-10">
        <div
          className="absolute top-[25%] h-[200%] w-full"
          style={{ clipPath: "inset(0 0 50% 0)" }}
        >
          <div>
            <Ripple
              numCircles={5}
              mainCircleSize={70}
              distanceBetweenCircles={20}
              mainCircleOpacity={0.15}
              opacityDecrement={0.02}
              delay={0.09}
              unit="vh"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomLoadingPanel;
