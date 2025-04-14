import { AppState } from "@cb/context/AppStateProvider";
import { useAppState, useRTC } from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
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
        joiningBackRoom(isYes);
        if (isYes) {
          setState(AppState.LOADING);
        } else {
          setState(AppState.HOME);
        }
      }}
      className={cn(
        "px-4 py-2 rounded-lg transition-colors flex items-center justify-center",
        {
          "bg-blue-600 text-white hover:bg-blue-700": isYes,
          "bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-400 dark:hover:bg-gray-600":
            !isYes,
        }
      )}
    >
      {label}
    </Button>
  );
};
