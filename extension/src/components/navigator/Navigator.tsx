import { RoomControlMenu } from "@cb/components/navigator/menu/RoomControlMenu";
import React from "react";
import { Toaster } from "sonner";
import EditorPanel from "@cb/components/panel/editor";
import { LoadingPanel } from "@cb/components/panel/LoadingPanel";
import { stateContext } from "@cb/context/StateProvider";
import { State } from "@cb/context/StateProvider";
import { useRTC, useTab } from "@cb/hooks/index";
import UserDropdown from "./dropdown/UserDropdown";

export const RootNavigator = () => {
  const { state } = React.useContext(stateContext);
  const { informations } = useRTC();
  const { activeTab } = useTab({
    informations,
  });

  const [isUserDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const toggleUserDropdown = (e: React.MouseEvent<Element, MouseEvent>) => {
    e.stopPropagation();
    setUserDropdownOpen(!isUserDropdownOpen);
  };

  const [displayMenu, setDisplayMenu] = React.useState(false);
  const wrapperSetDisplayMenu = (
    e: React.MouseEvent<Element, MouseEvent>,
    value: boolean
  ) => {
    e.stopPropagation();
    setDisplayMenu(value);
  };

  const onPanelClick = () => {
    setUserDropdownOpen(false);
    setDisplayMenu(false);
  };

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
      <div
        className={`flex justify-between items-center w-full bg-[--color-tabset-tabbar-background] h-9 rounded-t-lg p-2`}
      >
        <div className="flex items-center">
          <h2 className="font-medium">CodeBuddy</h2>
          {activeTab?.id && (
            <React.Fragment>
              <svg
                className="rtl:rotate-180 w-3 h-3 text-gray-400 mx-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 6 10"
              >
                <path
                  stroke="currentColor"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="m1 9 4-4-4-4"
                />
              </svg>{" "}
              <UserDropdown
                isOpen={isUserDropdownOpen}
                toggle={toggleUserDropdown}
              />
            </React.Fragment>
          )}
        </div>
        <RoomControlMenu
          displayMenu={displayMenu}
          setDisplayMenu={wrapperSetDisplayMenu}
        />
      </div>
      <div className="h-full w-full relative overflow-hidden">
        {state === State.HOME && localStorage.getItem("curRoomId") && (
          <div className="absolute inset-0 h-full w-full flex justify-center items-center">
            <LoadingPanel
              numberOfUsers={
                JSON.parse(localStorage.getItem("curRoomId") || "{}")
                  .numberOfUsers
              }
            />
          </div>
        )}
        <EditorPanel />
      </div>
    </div>
  );
};
