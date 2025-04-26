import { LeaveIcon } from "@cb/components/icons";
import { JoinPrivateRoom } from "@cb/components/panel/join/JoinPrivateRoom";
import PublicRoomTable from "@cb/components/panel/join/PublicRoomTable";
import { AppState, appStateContext } from "@cb/context/AppStateProvider";
import { useRTC } from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import { cn } from "@cb/utils/cn";
import React, { useContext, useEffect, useState } from "react";
import { sampleRooms } from "./sampleRooms.ts";

// Define the Room type
export interface Room {
  id: string;
  name: string;
  currentProblem: string;
  difficulty: "Easy" | "Medium" | "Hard";
  users: number;
  timeElapsed: number; // in seconds
}

const JoinRoomPanel: React.FC = () => {
  const { joinRoom } = useRTC();
  const { state: appState, setState: setAppState } =
    useContext(appStateContext);
  const [roomId, setRoomId] = useState<string>(""); // Room ID input
  const [publicRooms, setPublicRooms] = useState<Room[]>([]); // List of public rooms
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  useEffect(() => {
    // Use sample data for now
    setPublicRooms(sampleRooms);
  }, []);

  if (appState === AppState.JOIN_ROOMS) {
    return (
      <div className="flex flex-col p-4 gap-6">
        <Button
          className={cn(
            "flex items-center justify-center dark:text-white text-black w-[150px] hover:bg-[--color-button-hover-background] bg-[--color-button-background] dark:hover:bg-[--color-button-hover-background] dark:bg-[--color-button-background]"
          )}
          onClick={() => setAppState(AppState.HOME)} // Navigate back to Home
        >
          <div className="relative z-10 flex w-40 items-center justify-center gap-3 rounded-lg border px-4 py-2">
            <LeaveIcon />
            <span className="text-base font-medium">Back</span>
          </div>
        </Button>

        <JoinPrivateRoom />

        <div className="flex flex-col gap-4 w-full items-center">
          <h2 className="text-xl font-medium text-center">
            Browse public rooms
          </h2>

          <div className="w-[90%] max-w-2xl overflow-x-auto overflow-y-auto rounded-xl border border-gray-200 shadow-sm">
            <PublicRoomTable
              rooms={publicRooms}
              selectedRoomId={selectedRoomId}
              onSelectRoom={setSelectedRoomId}
            />

            <Button
              disabled={!selectedRoomId}
              className={cn(
                "mt-2 w-[90%] max-w-2xl",
                selectedRoomId
                  ? "bg-[#D92D20] text-white hover:bg-[#b7221a]"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
              onClick={() => {
                if (selectedRoomId) joinRoom(selectedRoomId);
              }}
            >
              Join
            </Button>
          </div>
        </div>
      </div>
    );
  }
};

export default JoinRoomPanel;
