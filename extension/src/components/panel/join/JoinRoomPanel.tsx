import ClosablePanel from "@cb/components/panel/ClosablePanel";
import { JoinPrivateRoom } from "@cb/components/panel/join/JoinPrivateRoom";
import PublicRoomTable from "@cb/components/panel/join/PublicRoomTable";
import { AppState, appStateContext } from "@cb/context/AppStateProvider";
import { useRTC } from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import React, { useContext, useState } from "react";

const JoinRoomPanel: React.FC = () => {
  const { joinRoom } = useRTC();
  const { setState: setAppState } = useContext(appStateContext);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

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

        <div className="flex flex-col grow overflow-hidden rounded-xl border border-[#78788033] dark:border-[#4A4A4E] dark:bg-dark-layer-bg">
          <PublicRoomTable
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
          />
          <div className="flex justify-center p-2 dark:bg-dark-layer-bg">
            <Button
              variant={selectedRoomId ? "destructive" : "secondary"}
              disabled={!selectedRoomId}
              className={`w-full ${
                selectedRoomId
                  ? "bg-[#DD5471] hover:bg-[--color-button-hover-background] dark:bg-[#FF6586]"
                  : "bg-[#78788033] hover:bg-[--color-button-hover-background] dark:text-white dark:bg-dark-layer-bg dark:hover:bg-dark-hover-bg"
              }`}
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
