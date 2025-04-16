import { AppState } from "@cb/context/AppStateProvider";
import { useAppState, useRTC } from "@cb/hooks/index";
import { Button } from "@cb/lib/components/ui/button";
import { removeLocalStorage } from "@cb/services";

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
      className="w-full rounded-md  py-2 font-medium text-base transition text-[#1E1E1E] dark:text-[#FFFFFF] hover:bg-[--color-button-hover-background] bg-[--color-button-background] dark:hover:bg-[--color-button-hover-background] dark:bg-[--color-button-background]"
    >
      {label}
    </Button>
  );
};
