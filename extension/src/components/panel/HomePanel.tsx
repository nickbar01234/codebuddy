import { CreateRoomDialog } from "@cb/components/dialog/CreateRoomDialog";
import { AppState } from "@cb/context/AppStateProvider";
import { useAppState } from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import { cn } from "@cb/utils/cn";
import { CodeIcon } from "lucide-react";
import { DefaultPanel } from "./DefaultPanel";

const HomePanel = () => {
  const { setState: setAppState } = useAppState();
  return (
    <DefaultPanel>
      <div className="flex min-w-max flex-col items-center gap-3">
        <CreateRoomDialog />
        <Button
          onClick={() => setAppState(AppState.JOIN_ROOMS)}
          className={cn(
            "flex items-center justify-center",
            "rounded-md text-[#1E1E1E] dark:text-white py-2 font-medium text-base transition",
            "bg-[--color-button-background] hover:bg-[--color-button-hover-background]",
            "border border-transparent hover:border-[#1E1E1E] dark:hover:border-white"
          )}
          aria-label={"Join Room"}
        >
          <CodeIcon />
          {"Join Room"}
        </Button>
      </div>
    </DefaultPanel>
  );
};

export default HomePanel;
