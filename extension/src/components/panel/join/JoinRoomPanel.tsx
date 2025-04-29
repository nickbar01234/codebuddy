import ClosablePanel from "@cb/components/panel/ClosablePanel";
import { JoinPrivateRoom } from "@cb/components/panel/join/JoinPrivateRoom";
import PublicRoomTable from "@cb/components/panel/join/PublicRoomTable";
import { AppState, appStateContext } from "@cb/context/AppStateProvider";
import { useOnMount, useRTC } from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import React, { useContext, useState } from "react";
import { Room } from "./PublicRoomTable.tsx";
import { sampleRooms } from "./sampleRooms.ts";

const JoinRoomPanel: React.FC = () => {
  const { joinRoom } = useRTC();
  const { setState: setAppState } = useContext(appStateContext);
  const [publicRooms, setPublicRooms] = useState<Room[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  useOnMount(() => {
    // Simulate loading delay for 1 second
    const timeout = setTimeout(() => {
      setPublicRooms(sampleRooms);
    }, 1000);

    return () => clearTimeout(timeout);
  });

  return (
    <ClosablePanel
      onClose={() => setAppState(AppState.HOME)}
      closeButtonName="Back"
      className="gap-6 dark:bg-dark-layer-bg"
    >
      <JoinPrivateRoom />
      <div className="flex flex-col grow gap-4 items-center">
        <h2 className="text-xl font-medium text-center dark:text-white">
          Browse public rooms
        </h2>

        <div className="flex flex-col grow overflow-hidden rounded-xl border dark:bg-dark-layer-bg">
          <PublicRoomTable
            rooms={publicRooms}
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
          />
          <div className="flex justify-center p-2 dark:bg-dark-layer-bg">
            <Button
              variant={selectedRoomId ? "destructive" : "secondary"}
              disabled={!selectedRoomId}
              className={
                "w-full dark:text-white dark:bg-dark-layer-bg dark:hover:bg-dark-hover-bg"
              }
              onClick={() => {
                if (selectedRoomId) joinRoom(selectedRoomId);
              }}
            >
              Join
            </Button>
          </div>
        </div>
      </div>
    </ClosablePanel>
  );
};

export default JoinRoomPanel;
