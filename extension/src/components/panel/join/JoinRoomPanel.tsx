import { LeaveIcon } from "@cb/components/icons";
import { JoinPrivateRoom } from "@cb/components/panel/join/JoinPrivateRoom";
import PublicRoomTable from "@cb/components/panel/join/PublicRoomTable";
import { AppState, appStateContext } from "@cb/context/AppStateProvider";
import { useRTC } from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import { cn } from "@cb/utils/cn";
import React, { useContext, useEffect, useState } from "react";

// Define the Room type
interface Room {
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
    const sampleRooms: Room[] = [
      {
        id: "1",
        name: "Rahhhhhh",
        currentProblem: "3. Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        users: 1,
        timeElapsed: 1342, // in seconds
      },
      {
        id: "2",
        name: "LeetCodeGenius",
        currentProblem: "1. Two Sum",
        difficulty: "Easy",
        users: 3,
        timeElapsed: 3791,
      },
      {
        id: "3",
        name: "HardCoreCoders",
        currentProblem:
          "1420. Build Array Where You Can Find The Maximum Exactly K Comparisons",
        difficulty: "Hard",
        users: 2,
        timeElapsed: 302,
      },
      {
        id: "4",
        name: "Rahhhhhh",
        currentProblem: "3. Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        users: 1,
        timeElapsed: 1342, // in seconds
      },
      {
        id: "5",
        name: "LeetCodeGenius",
        currentProblem: "1. Two Sum",
        difficulty: "Easy",
        users: 3,
        timeElapsed: 3791,
      },
      {
        id: "6",
        name: "HardCoreCoders",
        currentProblem:
          "1420. Build Array Where You Can Find The Maximum Exactly K Comparisons",
        difficulty: "Hard",
        users: 2,
        timeElapsed: 302,
      },
      {
        id: "7",
        name: "Rahhhhhh",
        currentProblem: "3. Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        users: 1,
        timeElapsed: 1342, // in seconds
      },
      {
        id: "8",
        name: "LeetCodeGenius",
        currentProblem: "1. Two Sum",
        difficulty: "Easy",
        users: 3,
        timeElapsed: 3791,
      },
      {
        id: "9",
        name: "HardCoreCoders",
        currentProblem:
          "1420. Build Array Where You Can Find The Maximum Exactly K Comparisons",
        difficulty: "Hard",
        users: 2,
        timeElapsed: 302,
      },
      {
        id: "10",
        name: "Rahhhhhh",
        currentProblem: "3. Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        users: 1,
        timeElapsed: 1342, // in seconds
      },
      {
        id: "11",
        name: "LeetCodeGenius",
        currentProblem: "1. Two Sum",
        difficulty: "Easy",
        users: 3,
        timeElapsed: 3791,
      },
      {
        id: "12",
        name: "HardCoreCoders",
        currentProblem:
          "1420. Build Array Where You Can Find The Maximum Exactly K Comparisons",
        difficulty: "Hard",
        users: 2,
        timeElapsed: 302,
      },
      {
        id: "13",
        name: "Rahhhhhh",
        currentProblem: "3. Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        users: 1,
        timeElapsed: 1342, // in seconds
      },
      {
        id: "14",
        name: "LeetCodeGenius",
        currentProblem: "1. Two Sum",
        difficulty: "Easy",
        users: 3,
        timeElapsed: 3791,
      },
      {
        id: "15",
        name: "HardCoreCoders",
        currentProblem:
          "1420. Build Array Where You Can Find The Maximum Exactly K Comparisons",
        difficulty: "Hard",
        users: 2,
        timeElapsed: 302,
      },
      {
        id: "16",
        name: "Rahhhhhh",
        currentProblem: "3. Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        users: 1,
        timeElapsed: 1342, // in seconds
      },
      {
        id: "17",
        name: "LeetCodeGenius",
        currentProblem: "1. Two Sum",
        difficulty: "Easy",
        users: 3,
        timeElapsed: 3791,
      },
      {
        id: "18",
        name: "HardCoreCoders",
        currentProblem:
          "1420. Build Array Where You Can Find The Maximum Exactly K Comparisons",
        difficulty: "Hard",
        users: 2,
        timeElapsed: 302,
      },
      {
        id: "19",
        name: "Rahhhhhh",
        currentProblem: "3. Longest Substring Without Repeating Characters",
        difficulty: "Medium",
        users: 1,
        timeElapsed: 1342, // in seconds
      },
      {
        id: "20",
        name: "LeetCodeGenius",
        currentProblem: "1. Two Sum",
        difficulty: "Easy",
        users: 3,
        timeElapsed: 3791,
      },
      {
        id: "21",
        name: "HardCoreCoders",
        currentProblem:
          "1420. Build Array Where You Can Find The Maximum Exactly K Comparisons",
        difficulty: "Hard",
        users: 2,
        timeElapsed: 302,
      },
    ];
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
          <h2 className="text-xl font-semibold text-center">
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
