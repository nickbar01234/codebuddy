import { CreateRoomDialog } from "@cb/components/dialog/CreateRoomDialog";
import { JoinRoomDialog } from "@cb/components/dialog/JoinRoomDialog";
import { baseButtonClassName } from "@cb/components/dialog/RoomDialog";
import { FEATURE_FLAG } from "@cb/constants";
import { useRoomActions } from "@cb/hooks/store";
import { Button } from "@cb/lib/components/ui/button";
import { CodeIcon } from "lucide-react";
import { DefaultPanel } from "./DefaultPanel";

const HomePanel = () => {
  const { browse } = useRoomActions();

  return (
    <DefaultPanel>
      <div className="flex min-w-max flex-col items-center gap-3">
        <CreateRoomDialog />
        {FEATURE_FLAG.DISABLE_BROWSE_ROOM ? (
          <JoinRoomDialog />
        ) : (
          <Button
            className={cn(
              baseButtonClassName,
              "flex items-center justify-center w-[150px]"
            )}
            onClick={browse}
          >
            <CodeIcon /> <span>Join room</span>
          </Button>
        )}
      </div>
    </DefaultPanel>
  );
};

export default HomePanel;
