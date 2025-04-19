import { RejoinPromptDialog } from "@cb/components/dialog/RejoinPromptDialog";
import { RoomControlMenu } from "@cb/components/navigator/menu/RoomControlMenu";
import EditorPanel from "@cb/components/panel/editor";
import HomePanel from "@cb/components/panel/HomePanel";
import JoinRoomPanel from "@cb/components/panel/join/JoinRoomPanel";
import { LoadingPanel } from "@cb/components/panel/LoadingPanel";
import Header from "@cb/components/ui/Header";
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
    <div className="flex h-full w-full flex-col">
      <div className="hide-scrollbar flex h-9 w-full items-center justify-between gap-2 overflow-y-hidden overflow-x-scroll rounded-t-lg bg-[--color-tabset-tabbar-background] p-2">
        <Header />
        <RoomControlMenu />
      </div>
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
          ) : state === AppState.PUBLIC_ROOMS ? (
            <JoinRoomPanel />
          ) : null}
        </div>
        <EditorPanel />
      </div>
    </div>
  );
};
