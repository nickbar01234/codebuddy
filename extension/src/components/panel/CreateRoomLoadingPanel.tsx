import { useRTC } from "@cb/hooks/index";
import { CopyIcon } from "lucide-react";
import { LeaveRoomDialog } from "@cb/components/dialog/LeaveRoomDialog";
import { LeaveIcon } from "@cb/components/icons";
import { LoadingPanel } from "@cb/components/panel/LoadingPanel";

const CreateRoomLoadingPanel = () => {
  const { roomId } = useRTC();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-4">
      <div className="mb-24 ml-4 self-start">
        <LeaveRoomDialog
          trigger={
            <button className="relative z-10 flex w-40 cursor-pointer items-center justify-center gap-3 rounded-lg border border-gray-400 px-4 py-2 hover:bg-[--color-tab-hover-background] dark:border-gray-600">
              <LeaveIcon />
              <span className="text-base font-medium">Leave Room</span>
            </button>
          }
        />
      </div>

      <div className="relative flex flex-col items-center text-center">
        <span className="text-2xl font-bold text-[#1E1E1E] dark:text-[#F1F1F1B2]">
          Room created successfully!
        </span>
        <span className="text-lg text-[#757575] dark:text-gray-400">
          Others can now join your room using the Room ID below
        </span>
      </div>

      <LoadingPanel numberOfUsers={0} />

      <div className="relative flex w-full max-w-sm flex-col items-center">
        <div className="mb-1 self-start text-xl font-semibold text-[#1E1E1E] dark:text-[#F1F1F1B2]">
          Room ID
        </div>
        <div className="flex w-full items-center overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600">
          <span className="w-full truncate px-4 py-3 font-mono text-lg text-[#1E1E1E] dark:text-[#F1F1F1B2]">
            {roomId ?? "Fetching Room ID..."}
          </span>
          <button
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
  );
};

export default CreateRoomLoadingPanel;
