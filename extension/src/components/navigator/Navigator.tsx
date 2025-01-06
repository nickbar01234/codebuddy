import { RoomControlMenu } from "@cb/components/navigator/menu/RoomControlMenu";
import EditorPanel from "@cb/components/panel/editor";
import { LoadingPanel } from "@cb/components/panel/LoadingPanel";
import { State, stateContext } from "@cb/context/StateProvider";
import React from "react";
import { Toaster } from "sonner";

export const RootNavigator = () => {
  const { state } = React.useContext(stateContext);
  const [displayMenu, setDisplayMenu] = React.useState(false);

  const onPanelClick = () => {
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
        </div>
        <RoomControlMenu
          displayMenu={displayMenu}
          setDisplayMenu={setDisplayMenu}
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
