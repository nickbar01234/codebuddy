import { LoadingPanel } from "./LoadingPanel";
import { LeaveIcon } from "../icons";
import { useRTC } from "@cb/hooks/index";
import { CopyIcon } from "lucide-react";

const CreateRoomLoadingPanel = ({ onLeaveRoom }: { onLeaveRoom: (e: React.MouseEvent<HTMLButtonElement>) => void } ) => {
    const { roomId } = useRTC();

    return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4">
        <div className="self-start mb-4 mt-4 ml-4">
            <button className="flex z-10 relative items-center gap-4 w-48 px-6 py-3 rounded-lg border-2 border-gray-300 hover:bg-slate-300 justify-center cursor-pointer" onClick={onLeaveRoom}>
                <LeaveIcon />
                <span className="text-lg font-medium">Leave Room</span>
            </button>
        </div>

        <div className="relative flex flex-col items-center text-center mb-1 border-2">
            <span className="font-bold text-2xl">Room created successfully!</span>
            <span className="text-lg text-gray-500">
                Others can now join your room using the Room ID below
            </span>
        </div>
            
            <LoadingPanel numberOfUsers={0} />


        <div className="relative flex flex-col items-center mt-1 w-full max-w-sm border-2">
            <div className="font-bold mb-1 text-gray-700">Room ID</div>
            <div className="flex items-center w-full border border-gray-300 rounded-lg overflow-hidden">
                <span className="w-full px-4 py-2 text-sm font-mono text-gray-700 truncate">
                    {roomId ?? "Fetching Room ID..."}
                </span>
                <button className="p-2 bg-gray-200 hover:bg-gray-300">
                    <CopyIcon
                        className="w-5 h-5 text-gray-600 cursor-pointer"
                        onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(roomId ?? "");
                        }}
                    />
                </button>
            </div>
        </div>

        
    </div>
    )
    
}

export default CreateRoomLoadingPanel;
