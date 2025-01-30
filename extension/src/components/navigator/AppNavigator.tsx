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
import { Toaster } from "sonner";
import { RejoinPrompt } from "./menu/RejoinPrompt";
import { cn } from "@cb/utils/cn";

export const AppNavigator = () => {
  const { state } = React.useContext(appStateContext);
  const { peers, activePeer, setActivePeerId } = usePeerSelection();
  useDevSetupRoom();

  const [isUserDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const toggleUserDropdown = (e: React.MouseEvent<Element, MouseEvent>) => {
    e.stopPropagation();
    setUserDropdownOpen(!isUserDropdownOpen);
  };

  const [displayMenu, setDisplayMenu] = React.useState(false);

  const onPanelClick = () => {
    setUserDropdownOpen(false);
    setDisplayMenu(false);
  };

  const currentTabInfo = getLocalStorage("tabs");

  return (
    <div
      className="h-full w-full relative flex flex-col"
      onClick={onPanelClick}
    >
      <Toaster
        richColors
        expand
        closeButton
        visibleToasts={5}
        toastOptions={{
          duration: 10 * 1000,
        }}
      />
      <div className="flex justify-between items-center w-full bg-[--color-tabset-tabbar-background] h-9 rounded-t-lg p-2 overflow-y-hidden overflow-x-scroll hide-scrollbar gap-y-2">
        <div className="flex items-center">
          <h2 className="font-medium">CodeBuddy</h2>
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
        <RoomControlMenu
          displayMenu={displayMenu}
          setDisplayMenu={setDisplayMenu}
        />
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
      <div className="flex items-center w-full bg-[--color-tabset-tabbar-background] h-12 rounded-b-lg p-2 overflow-x-auto overflow-y-hidden text-sm self-end">
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
