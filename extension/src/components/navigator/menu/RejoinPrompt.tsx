import { AppState } from "@cb/context/AppStateProvider";
import { useAppState, useRTC } from "@cb/hooks/index";
import { cn } from "@cb/utils/cn";

export const RejoinPrompt = () => {
  return (
    <div className="rounded-lg shadow-2xl w-[90%] max-w-sm">
      <h1 className="text-lg font-semibold text-black dark:text-white  mb-4 text-center">
        Do you want to rejoin the room?
      </h1>

      <div className="flex gap-4 justify-center">
        <RenderButton label="No" isYes={false} />
        <RenderButton label="Yes" isYes={true} />
      </div>
    </div>
  );
};
const RenderButton = ({ label, isYes }: { label: string; isYes: boolean }) => {
  const { joiningBackRoom } = useRTC();
  const { setState } = useAppState();
  return (
    <button
      type="button"
      onClick={() => {
        joiningBackRoom(isYes);
        setState(AppState.LOADING);
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
    </button>
  );
};
