import { CaretRightIcon } from "@cb/components/icons";
import UserDropdown from "@cb/components/navigator/dropdown/UserDropdown";
import { RoomControlMenu } from "@cb/components/navigator/menu/RoomControlMenu";
import EditorPanel from "@cb/components/panel/editor";
import { LoadingPanel } from "@cb/components/panel/LoadingPanel";
import { AppState, appStateContext } from "@cb/context/AppStateProvider";
import { usePeerSelection } from "@cb/hooks/index";
import useDevSetupRoom from "@cb/hooks/useDevSetupRoom";
import { getLocalStorage } from "@cb/services";
import React from "react";
import { RejoinPrompt } from "./menu/RejoinPrompt";
import { cn } from "@cb/utils/cn";
import Header from "@cb/components/ui/Header";

export const AppNavigator = () => {
  const { state } = React.useContext(appStateContext);
  const { peers, activePeer, setActivePeerId } = usePeerSelection();
  useDevSetupRoom();

  const [isUserDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const toggleUserDropdown = (e: React.MouseEvent<Element, MouseEvent>) => {
    e.stopPropagation();
    setUserDropdownOpen(!isUserDropdownOpen);
  };
  const currentTabInfo = getLocalStorage("tabs");

  return (
    <div className="h-full w-full relative flex flex-col">
      <div className="flex justify-between items-center w-full bg-[--color-tabset-tabbar-background] h-9 rounded-t-lg p-2 overflow-y-hidden overflow-x-scroll hide-scrollbar gap-2">
        <div className="flex items-center">
          <Header />
          {state === AppState.ROOM && activePeer?.id && (
            <React.Fragment>
              <CaretRightIcon />{" "}
              <UserDropdown
                isOpen={isUserDropdownOpen}
                toggle={toggleUserDropdown}
              />
            </React.Fragment>
          )}
        </div>
        <RoomControlMenu />
      </div>
      <div className="h-full w-full relative overflow-hidden">
        <div className="absolute inset-0 h-full w-full flex justify-center items-center">
          {state === AppState.LOADING ? (
            <LoadingPanel
              numberOfUsers={Object.keys(currentTabInfo?.peers ?? 0).length}
            />
          ) : state === AppState.REJOINING ? (
            <RejoinPrompt />
          ) : null}
        </div>
        <EditorPanel />
      </div>
      <div
        className={cn(
          "flex items-center w-full bg-[--color-tabset-tabbar-background] h-12 rounded-b-lg p-2 overflow-x-auto overflow-y-hidden text-sm self-end",
          { hidden: peers.length === 0 }
        )}
      >
        {peers.map(({ id, active }) => (
          <React.Fragment key={id}>
            {/* Leetcode className flexlayout__tab_button_* */}
            <div
              className={cn(
                `relative flexlayout__tab_button flexlayout__tab_button_top hover:z-50`,
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
