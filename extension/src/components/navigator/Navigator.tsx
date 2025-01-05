import { Menu } from "@cb/components/navigator/menu/Menu";
import React from "react";
import { Toaster } from "sonner";
import EditorPanel from "@cb/components/panel/editor";
import { LoadingPanel } from "@cb/components/panel/LoadingPanel";
import { stateContext } from "@cb/context/StateProvider";
import { State } from "@cb/context/StateProvider";
import { MenuIcon } from "@cb/components/icons";

export const RootNavigator = () => {
  const { state } = React.useContext(stateContext);
  const [displayPopup, setDisplayPopup] = React.useState(false);

  return (
    <div className="h-full w-full relative flex flex-col">
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
        className={`flex justify-between items-center w-full bg-[--color-tabset-tabbar-background] h-9 rounded-t-lg p-2 overflow-x-auto overflow-y-hidden`}
      >
        <h2 className="text-lg font-medium">Code Buddy</h2>
        <button onClick={() => localStorage.clear()} className="text-sm">
          Clear local storage
        </button>
        <button
          className="hover:text-label-1 dark:hover:text-dark-label-1 flex cursor-pointer items-center justify-center rounded-md w-6 h-6 hover:bg-fill-secondary p-1"
          id="headlessui-menu-button-:r3q:"
          type="button"
          aria-haspopup="true"
          aria-expanded="false"
          data-headlessui-state=""
          onClick={() => setDisplayPopup((displayPopup) => !displayPopup)}
        >
          <MenuIcon />
        </button>
      </div>
      <div className="h-full w-full relative overflow-hidden ">
        <Menu displayMenu={displayPopup} setDisplayMenu={setDisplayPopup} />
        {state === State.HOME &&
          (localStorage.getItem("curRoomId") ? (
            <div className="absolute inset-0 h-full w-full flex justify-center items-center">
              <LoadingPanel
                numberOfUsers={
                  JSON.parse(localStorage.getItem("curRoomId") || "{}")
                    .numberOfUsers
                }
              />
            </div>
          ) : (
            <div className="text-5xl">HOME PANEL</div>
          ))}
        <EditorPanel />
      </div>
    </div>
  );
};
