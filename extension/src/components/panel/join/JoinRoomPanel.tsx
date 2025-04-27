import { LeaveIcon } from "@cb/components/icons";
import { JoinPrivateRoom } from "@cb/components/panel/join/JoinPrivateRoom";
import PublicRoomTable from "@cb/components/panel/join/PublicRoomTable";
import { AppState, appStateContext } from "@cb/context/AppStateProvider";
import { useRTC } from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import React, { useContext, useEffect, useState } from "react";
import { sampleRooms } from "./sampleRooms.ts";

// Define the Room type
export interface Room {
  id: string;
  name: string;
  currentProblem: string;
  difficulty: "Easy" | "Medium" | "Hard";
  users: number;
  timeElapsed: number;
}

const JoinRoomPanel: React.FC = () => {
  const { joinRoom } = useRTC();
  const { state: appState, setState: setAppState } =
    useContext(appStateContext);
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading delay for 1 second
    const timeout = setTimeout(() => {
      setPublicRooms(sampleRooms);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timeout);
  }, []);

  if (appState === AppState.JOIN_ROOMS) {
    return (
      <div className="flex flex-col h-[90vh] w-full max-w-[600px] p-4 gap-6">
        <Button
          variant={"outline"}
          className={
            "left-2 top-2 w-24 dark:text-white hover:bg-[--color-button-hover-background] dark:hover:bg-[--color-button-hover-background] dark:bg-[--color-button-background]"
          }
          onClick={() => setAppState(AppState.HOME)}
        >
          <div className="flex items-center justify-center gap-3">
            <LeaveIcon />
            <span className="text-base font-medium">Back</span>
          </div>
        </Button>

        <JoinPrivateRoom />

        <div className="flex flex-col grow gap-4 items-center">
          <h2 className="text-xl font-medium text-center">
            Browse public rooms
          </h2>

          <div className="flex flex-col grow overflow-hidden rounded-xl border">
            <PublicRoomTable
              rooms={publicRooms}
              selectedRoomId={selectedRoomId}
              onSelectRoom={setSelectedRoomId}
              headers={[
                "Room Name",
                "Current Problem",
                "Difficulty",
                "Users",
                "Time Elapsed",
              ]}
              loading={isLoading}
            />
            <div className="flex justify-center p-2">
              <Button
                variant={selectedRoomId ? "destructive" : "secondary"}
                disabled={!selectedRoomId}
                className={"w-full"}
                onClick={() => {
                  if (selectedRoomId) joinRoom(selectedRoomId);
                }}
              >
                Join
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default JoinRoomPanel;
