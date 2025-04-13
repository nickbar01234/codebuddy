import { RenderButton } from "@cb/components/ui/RenderButton";
import { AppState } from "@cb/context/AppStateProvider";
import { useAppState, useRTC } from "@cb/hooks/index";
import { throttle } from "lodash";
import React from "react";

export const Decision = () => {
  const { handleNavigateToNextQuestion } = useRTC();
  const { setState: setAppState } = useAppState();
  const { roomId, leaveRoom } = useRTC();

  const leaveRoomThrottled = React.useMemo(() => {
    return throttle(() => {
      setAppState(AppState.HOME);
      if (roomId) {
        leaveRoom(roomId);
      }
    }, 1000);
  }, [roomId, leaveRoom, setAppState]);
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
        <RenderButton label="NO" isYes={false} onClick={leaveRoomThrottled} />
      </div>
    </div>
  );
};
