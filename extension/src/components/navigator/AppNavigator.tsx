import { RejoinPromptDialog } from "@cb/components/dialog/RejoinPromptDialog";
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
      <div className="absolute inset-0 flex h-full w-full items-center justify-center mx-2">
        {roomStatus === RoomStatus.LOADING ? (
          <LoadingPanel numberOfUsers={0} />
        ) : roomStatus === RoomStatus.HOME ? (
          <HomePanel />
        ) : null}
      </div>
      <EditorPanel />
      <RejoinPromptDialog />
      <RoomInfo />
    </div>
  );
};
