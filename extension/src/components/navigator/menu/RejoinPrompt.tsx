import { AppState } from "@cb/context/AppStateProvider";
import { useAppState, useRTC } from "@cb/hooks/index";
import { RenderButton } from "@cb/components/ui/RenderButton";

export const RejoinPrompt = () => {
  const { joiningBackRoom } = useRTC();
  const { setState } = useAppState();
  return (
    <div className="w-[90%] max-w-sm rounded-lg shadow-2xl">
      <h1 className="mb-4 text-center text-lg font-semibold text-black dark:text-white">
        Do you want to rejoin the room?
      </h1>

      <div className="flex justify-center gap-4">
        <RenderButton
          label="No"
          onClick={() => {
            joiningBackRoom(false);
            setState(AppState.HOME);
          }}
        />
        <RenderButton
          label="Yes"
          isYes
          onClick={() => {
            joiningBackRoom(true);
            setState(AppState.LOADING);
          }}
        />
      </div>
    </div>
  );
};
