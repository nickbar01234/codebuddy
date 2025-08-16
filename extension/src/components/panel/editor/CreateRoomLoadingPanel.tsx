import { LeaveRoomDialog } from "@cb/components/dialog/LeaveRoomDialog";
import { LeaveIcon } from "@cb/components/icons";
import { Ripple } from "@cb/components/panel/Ripple";
import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { useRoom } from "@cb/store";
import { CopyIcon } from "lucide-react";

const CreateRoomLoadingPanel = () => {
  const roomId = useRoom((state) => state.room?.id);
  const copyRoomId = useCopyRoomId();

  return (
    <div className="flex h-full w-full flex-col relative items-center p-4">
      <div className="left-7 top-5 absolute self-start z-30">
        <LeaveRoomDialog
          node={
            <div className="relative z-10 flex w-40 items-center justify-center gap-3 rounded-lg border px-4 py-2">
              <LeaveIcon />
              <span className="text-base font-medium">Leave Room</span>
            </div>
          }
        />
      </div>

      <div className="relative z-20 top-[15vh] justify-center flex flex-col gap-1 items-center">
        <span className="text-3xl font-bold text-[#1E1E1E] dark:text-white">
          Room created successfully!
        </span>
        <span className="text-lg text-[#757575] dark:text-[#F1F1F1B2]">
          Others can now join your room using the Room ID below
        </span>
        <div className="mt-5 flex w-full max-w-sm flex-col items-center">
          <div className="flex w-full items-center overflow-hidden rounded-lg border border-[#78788033] dark:border-[#49494E] justify-between">
            <SkeletonWrapper
              loading={roomId == null}
              outerClassName="min-h-[52px] py-3 px-4"
            >
              <span className="w-full truncate font-mono text-lg text-[#757575] dark:text-[#F1F1F1B2]">
                {roomId}
              </span>
            </SkeletonWrapper>
            <div className="flex h-full w-12 items-center justify-center bg-[--color-button-background] dark:bg-[--color-button-background] hover:bg-[--color-button-hover-background] dark:hover:bg-[--color-button-hover-background]">
              <button
                type="button"
                aria-label="Copy room ID"
                onClick={copyRoomId}
              >
                <CopyIcon className="h-6 w-6 cursor-pointer" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 h-full w-full z-10 overflow-hidden">
        <div
          className="absolute top-[40%] h-[200%] w-full"
          style={{ clipPath: "inset(0 0 50% 0)" }}
        >
          <div>
            <Ripple
              numCircles={5}
              mainCircleSize={74}
              distanceBetweenCircles={22}
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
