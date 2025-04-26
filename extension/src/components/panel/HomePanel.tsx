import { CreateRoomDialog } from "@cb/components/dialog/CreateRoomDialog";
import { JoinRoomDialog } from "@cb/components/dialog/JoinRoomDialog";
import { DefaultPanel } from "./DefaultPanel";

const HomePanel = () => {
  return (
    <DefaultPanel>
      <div className="flex min-w-max flex-col items-center gap-3">
        <CreateRoomDialog />
        <JoinRoomDialog />
      </div>
    </DefaultPanel>
  );
};

export default HomePanel;
