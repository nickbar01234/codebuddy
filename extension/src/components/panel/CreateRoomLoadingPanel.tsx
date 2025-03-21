import { LeaveIcon } from "../icons";
import { useRTC } from "@cb/hooks/index";
import { CopyIcon } from "lucide-react";
import { UserIcon } from "@cb/components/icons/UserIcon";
import { Ripple } from "@cb/components/ui/Ripple";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@cb/lib/components/ui/dialog";

const CreateRoomLoadingPanel = ({
  onLeaveRoom,
}: {
  onLeaveRoom: (e: React.MouseEvent<HTMLButtonElement>) => void;
}) => {
  const { roomId } = useRTC();

  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-4">
      <div className="mb-24 ml-4 self-start">
        <Dialog>
          <DialogTrigger>
            <button className="relative z-10 flex w-40 cursor-pointer items-center justify-center gap-3 rounded-lg border border-[#787880] px-4 py-2 hover:bg-slate-300">
              <LeaveIcon />
              <span className="text-base font-medium">Leave Room</span>
            </button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-left text-xl">
                Are you sure that you want to leave the room?
              </DialogTitle>
              <DialogDescription className="text-left font-medium">
                You will be disconnected, and you may not be able to rejoin
                unless invited again.
              </DialogDescription>
              <div className="mt-4 flex w-full items-center justify-end gap-2 self-end">
                <button
                  className="h-10 rounded-md px-4 py-2 hover:bg-slate-300"
                  onClick={onLeaveRoom}
                >
                  <span className="text-sm font-medium">Yes</span>
                </button>
                <DialogClose asChild>
                  <button className="h-10 rounded-md px-4 py-2 hover:bg-slate-300">
                    <span className="text-sm font-medium">No</span>
                  </button>
                </DialogClose>
              </div>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative flex flex-col items-center text-center">
        <span className="text-2xl font-bold">Room created successfully!</span>
        <span className="text-lg text-gray-500">
          Others can now join your room using the Room ID below
        </span>
      </div>

      <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-lg">
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
