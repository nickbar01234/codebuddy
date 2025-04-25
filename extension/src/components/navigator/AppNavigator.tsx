import { RejoinPromptDialog } from "@cb/components/dialog/RejoinPromptDialog";
import EditorPanel from "@cb/components/panel/editor";
import HomePanel from "@cb/components/panel/HomePanel";
import JoinRoomPanel from "@cb/components/panel/join/JoinRoomPanel";
import { LoadingPanel } from "@cb/components/panel/LoadingPanel";
import { AppState, appStateContext } from "@cb/context/AppStateProvider";
import useDevSetupRoom from "@cb/hooks/useDevSetupRoom";
import { getLocalStorage } from "@cb/services";
import { getQuestionIdFromUrl } from "@cb/utils";
import React from "react";

export const AppNavigator = () => {
  const { state } = React.useContext(appStateContext);
  useDevSetupRoom();

  const currentTabInfo = getLocalStorage("tabs");

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div className="absolute inset-0 flex h-full w-full items-center justify-center mx-2">
        {state === AppState.LOADING ? (
          <LoadingPanel
            numberOfUsers={
              Object.keys(
                currentTabInfo?.sessions[
                  getQuestionIdFromUrl(window.location.href)
                ]?.peers ?? {}
              ).length
            }
          />
        ) : state === AppState.REJOINING ? (
          <RejoinPromptDialog />
        ) : state === AppState.HOME ? (
          <HomePanel />
        ) : state === AppState.JOIN_ROOMS ? (
          <JoinRoomPanel />
        ) : null}
      </div>

      <EditorPanel />
    </div>
  );
};
