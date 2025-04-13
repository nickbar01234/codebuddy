import { RenderButton } from "@cb/components/ui/RenderButton";
import { AppState } from "@cb/context/AppStateProvider";
import { useAppState, useRTC } from "@cb/hooks/index";
import { throttle } from "lodash";
import React from "react";

export const RejoinPrompt = () => {
  const { joiningBackRoom } = useRTC();
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
    <div className="w-[90%] max-w-sm rounded-lg shadow-2xl">
      <h1 className="mb-4 text-center text-lg font-semibold text-black dark:text-white">
        Do you want to rejoin the room?
      </h1>

      <div className="flex justify-center gap-4">
        <RenderButton label="No" onClick={leaveRoomThrottled} />
        <RenderButton
          label="Yes"
          isYes
          onClick={() => {
            joiningBackRoom(true);
            setAppState(AppState.LOADING);
          }}
        />
      </div>
    </div>
  );
};
