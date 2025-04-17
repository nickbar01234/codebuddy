import { AppState } from "@cb/context/AppStateProvider";
import { useAppState, useRTC } from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import { removeLocalStorage } from "@cb/services";
import { cn } from "@cb/utils/cn";

export const RenderButton = ({
  label,
  isYes = false,
}: {
  label: string;
  isYes?: boolean;
}) => {
  const { joiningBackRoom } = useRTC();
  const { setState } = useAppState();
  return (
    <Button
      type="button"
      onClick={() => {
        removeLocalStorage("closingTabs");
        joiningBackRoom(isYes);
        if (isYes) {
          setState(AppState.LOADING);
        } else {
          setState(AppState.HOME);
        }
      }}
      className={cn(
        "px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
      )}
    >
      {label}
    </Button>
  );
};
