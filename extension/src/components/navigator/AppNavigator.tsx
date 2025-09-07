import { RejoinPromptDialog } from "@cb/components/dialog/RejoinPromptDialog";
import EditorPanel from "@cb/components/panel/editor";
import HomePanel from "@cb/components/panel/HomePanel";
import { RoomInfo } from "@cb/components/panel/info";
import { LoadingPanel } from "@cb/components/panel/LoadingPanel";
import { getLocalStorage } from "@cb/services";
import { RoomStatus, useRoom } from "@cb/store";
import { getSessionId } from "@cb/utils";

export const AppNavigator = () => {
  const roomStatus = useRoom((state) => state.status);
  const currentTabInfo = getLocalStorage("tabs");
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
      <RoomInfo />
    </div>
  );
};
