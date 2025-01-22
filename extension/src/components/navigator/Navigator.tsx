import { RoomControlMenu } from "@cb/components/navigator/menu/RoomControlMenu";
import EditorPanel from "@cb/components/panel/editor";
import { LoadingPanel } from "@cb/components/panel/LoadingPanel";
import React from "react";
import { Toaster } from "sonner";
import { CaretRightIcon } from "@cb/components/icons";
import UserDropdown from "@cb/components/navigator/dropdown/UserDropdown";
import { AppState, appStateContext } from "@cb/context/AppStateProvider";
import { usePeerSelection, useRTC } from "@cb/hooks/index";
import { getLocalStorage } from "@cb/services";
import useDevMode from "@cb/hooks/useDevMode";

export const RootNavigator = () => {
  const { state } = React.useContext(appStateContext);
  const { activePeer } = usePeerSelection();
  useDevMode();
  const { joiningBackRoom } = useRTC();

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
          {state === AppState.HOME &&
            currentTabInfo &&
            ((
              performance.getEntriesByType(
                "navigation"
              )[0] as PerformanceNavigationTiming
            ).type === "reload" ? (
              <LoadingPanel
                numberOfUsers={Object.keys(currentTabInfo.peers).length}
              />
            ) : (
              // TODO: clean up this
              <div className="rounded-lg shadow-2xl w-[90%] max-w-sm">
                <h1 className="text-lg font-semibold text-black dark:text-white  mb-4 text-center">
                  Do you want to rejoin the room?
                </h1>
                <div className="flex gap-4 justify-center">
                  <button
                    type="button"
                    onClick={() => {
                      joiningBackRoom(false);
                    }}
                    className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-600 transition-colors"
                  >
                    No
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      joiningBackRoom(true);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Yes
                  </button>
                </div>
              </div>
            ))}
        </div>
        <EditorPanel />
      </div>
    </div>
  );
};
