import { LeaveIcon } from "../icons";
import { useRTC } from "@cb/hooks/index";
import { CopyIcon } from "lucide-react";
import { UserIcon } from "@cb/components/icons/UserIcon";
import { Ripple } from "@cb/components/ui/Ripple";

const CreateRoomLoadingPanel = ({
  onLeaveRoom,
}: {
  onLeaveRoom: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  const { roomId } = useRTC();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-4">
      <div className="mb-24 ml-4 self-start">
        <button
          className="relative z-10 flex w-40 cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-gray-300 px-4 py-2 hover:bg-slate-300"
          onClick={onLeaveRoom}
        >
          <LeaveIcon />
          <span className="text-base font-medium">Leave Room</span>
        </button>
      </div>

      <div className="relative flex flex-col items-center text-center">
        <span className="text-2xl font-bold">Room created successfully!</span>
        <span className="text-lg text-gray-500">
          Others can now join your room using the Room ID below
        </span>
      </div>

      <div className="relative flex h-[90%] w-full flex-col items-center justify-center overflow-hidden rounded-lg">
        <div className="z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]">
          <UserIcon />
        </div>
        <Ripple />
      </div>

      <div className="relative flex w-full max-w-sm flex-col items-center">
        <div className="mb-1 self-start text-xl font-bold text-gray-700">
          Room ID
        </div>
        <div className="flex w-full items-center overflow-hidden rounded-lg border border-gray-300">
          <span className="w-full truncate px-4 py-3 font-mono text-lg text-gray-700">
            {roomId ?? "Fetching Room ID..."}
          </span>
          <button
            className="flex h-full w-12 items-center justify-center bg-gray-200 hover:bg-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(roomId ?? "");
            }}
          >
            <CopyIcon className="h-6 w-6 cursor-pointer text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoomLoadingPanel;
