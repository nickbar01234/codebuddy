import { RenderButton } from "@cb/components/ui/RenderButton";
import { AppState } from "@cb/context/AppStateProvider";
import { useAppState, useRTC } from "@cb/hooks/index";

export const Decision = () => {
  const { handleNavigateToNextQuestion, joiningBackRoom } = useRTC();
  const { setState: setAppState } = useAppState();
  return (
    <div className="flex w-full flex-col">
      <h1 className="mb-4 text-center text-lg font-semibold text-black dark:text-white">
        Do you want to go on to next question?
      </h1>
      <div className="flex justify-center gap-4">
        <RenderButton
          label="YES"
          isYes={true}
          onClick={handleNavigateToNextQuestion}
        />
        <RenderButton
          label="NO"
          isYes={false}
          onClick={() => {
            joiningBackRoom(false);
            setAppState(AppState.HOME);
          }}
        />
      </div>
    </div>
  );
};
