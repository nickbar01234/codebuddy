import { RoomControlMenu } from "@cb/components/navigator/menu/RoomControlMenu";
import EditorPanel from "@cb/components/panel/editor";
import HomePanel from "@cb/components/panel/HomePanel";
import { LoadingPanel } from "@cb/components/panel/LoadingPanel";
import Header from "@cb/components/ui/Header";
import { AppState, appStateContext } from "@cb/context/AppStateProvider";
import { usePeerSelection } from "@cb/hooks/index";
import useDevSetupRoom from "@cb/hooks/useDevSetupRoom";
import { getLocalStorage } from "@cb/services";
import { getQuestionIdFromUrl } from "@cb/utils";
import { cn } from "@cb/utils/cn";
import React from "react";
import { RejoinPrompt } from "./menu/RejoinPrompt";

export const AppNavigator = () => {
  const { state } = React.useContext(appStateContext);
  const { peers, setActivePeerId } = usePeerSelection();
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
            <RejoinPrompt />
          ) : state === AppState.HOME ? (
            <HomePanel />
          ) : null}
        </div>
        <EditorPanel />
      </div>
      <div
        className={cn(
          "flex h-12 w-full items-center self-end overflow-x-auto overflow-y-hidden rounded-b-lg bg-[--color-tabset-tabbar-background] p-2 text-sm",
          { hidden: peers.length === 0 }
        )}
      >
        {peers.map(({ id, active }) => (
          <React.Fragment key={id}>
            {/* Leetcode className flexlayout__tab_button_* */}
            <div
              className={cn(
                `flexlayout__tab_button flexlayout__tab_button_top relative hover:z-50`,
                {
                  "flexlayout__tab_button-selected medium": active,
                  "flexlayout__tab_button--unselected normal": !active,
                }
              )}
              onClick={() => setActivePeerId(id)}
            >
              {id}
            </div>
            {/* Leetcode className flexlayout__tabset_tab_divider */}
            <div className="flexlayout__tabset_tab_divider" />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
