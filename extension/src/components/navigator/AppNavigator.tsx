import { RejoinPromptDialog } from "@cb/components/dialog/RejoinPromptDialog";
import { BrowsePanel } from "@cb/components/panel/BrowsePanel";
import EditorPanel from "@cb/components/panel/editor";
import HomePanel from "@cb/components/panel/HomePanel";
import { RoomInfo } from "@cb/components/panel/info";
import { LoadingPanel } from "@cb/components/panel/LoadingPanel";
import { useRoomStatus } from "@cb/hooks/store";
import { RoomStatus } from "@cb/store";

export const AppNavigator = () => {
  const roomStatus = useRoomStatus();
  return (
    <div className="relative h-full w-full overflow-hidden bg-secondary">
      <div
        className={cn("p-2 h-full w-full", {
          hidden: roomStatus === RoomStatus.IN_ROOM,
        })}
      >
        {roomStatus === RoomStatus.LOADING ? (
          <div className="absolute inset-0 flex h-full w-full items-center justify-center mx-2">
            <LoadingPanel numberOfUsers={0} />
          </div>
        ) : roomStatus === RoomStatus.HOME ? (
          <HomePanel />
        ) : roomStatus === RoomStatus.BROWSING_ROOM ? (
          <BrowsePanel />
        ) : null}
      </div>
      <EditorPanel />
      <RejoinPromptDialog />
      <RoomInfo />
    </div>
  );
};
