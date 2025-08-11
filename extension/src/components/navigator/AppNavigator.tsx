import { RejoinPromptDialog } from "@cb/components/dialog/RejoinPromptDialog";
import EditorPanel from "@cb/components/panel/editor";
import HomePanel from "@cb/components/panel/HomePanel";
import { LoadingPanel } from "@cb/components/panel/LoadingPanel";
import useDevSetupRoom from "@cb/hooks/useDevSetupRoom";
import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "@cb/services";
import { RoomStatus, roomStore } from "@cb/store";
import { getSessionId } from "@cb/utils";
import { useStore } from "zustand";

export const AppNavigator = () => {
  const roomStatus = useStore(roomStore, (state) => state.room.status);
  const loadingRoom = useStore(roomStore, (state) => state.actions.loadingRoom);
  const rejoiningRoom = useStore(
    roomStore,
    (state) => state.actions.rejoiningRoom
  );
  useDevSetupRoom();

  const currentTabInfo = getLocalStorage("tabs");

  useOnMount(() => {
    const refreshInfo = getLocalStorage("tabs");
    const maybeReload = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    const navigate = getLocalStorage("navigate") == "true";
    const closingTabs = getLocalStorage("closingTabs");
    removeLocalStorage("navigate");
    if (refreshInfo?.roomId) {
      if ((maybeReload.type === "reload" || navigate) && !closingTabs) {
        loadingRoom();
      } else {
        setLocalStorage("closingTabs", true);
        rejoiningRoom();
      }
    }
  });

  return (
    <div className="relative h-full w-full overflow-hidden bg-secondary">
      <div className="absolute inset-0 flex h-full w-full items-center justify-center mx-2">
        {roomStatus === RoomStatus.LOADING ? (
          <LoadingPanel
            numberOfUsers={
              Object.keys(currentTabInfo?.sessions[getSessionId()]?.peers ?? {})
                .length
            }
          />
        ) : roomStatus === RoomStatus.REJOINING ? (
          <RejoinPromptDialog />
        ) : roomStatus === RoomStatus.HOME ? (
          <HomePanel />
        ) : null}
      </div>
      <EditorPanel />
    </div>
  );
};
