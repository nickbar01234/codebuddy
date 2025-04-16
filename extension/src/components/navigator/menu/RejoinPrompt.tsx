import { LeaveRoomDialog } from "@cb/components/dialog/LeaveRoomDialog";
import { RenderButton } from "@cb/components/ui/RenderButton";
import { AppState } from "@cb/context/AppStateProvider";
import { useAppState, useRTC } from "@cb/hooks/index";

export const RejoinPrompt = () => {
  const { joiningBackRoom } = useRTC();
  const { setState: setAppState } = useAppState();

  return (
    <div className="w-[90%] max-w-sm rounded-lg shadow-2xl">
      <h1 className="mb-4 text-center text-lg font-semibold text-black dark:text-white">
        Do you want to rejoin the room?
      </h1>

      <div className="flex justify-center gap-4">
        <LeaveRoomDialog
          trigger={<RenderButton label="No" onClick={() => {}} />}
        />
        <RenderButton
          label="Yes"
          isYes
          onClick={() => {
            joiningBackRoom();
            setAppState(AppState.LOADING);
          }}
        />
      </div>
    </div>
  );
};
