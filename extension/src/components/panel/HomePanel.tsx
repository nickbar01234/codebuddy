import { CreateRoomDialog } from "@cb/components/dialog/CreateRoomDialog";
import { JoinRoomButton } from "@cb/components/panel/join/JoinRoomButton";
import { DefaultPanel } from "./DefaultPanel";

const HomePanel = () => {
  return (
    <DefaultPanel>
      <div className="flex min-w-max flex-col items-center gap-3">
        <CreateRoomDialog />
        <JoinRoomButton />
      </div>
    </DefaultPanel>
  );
};

export default HomePanel;
