import { Menu } from "@cb/components/navigator/menu/Menu";
import React from "react";
import { Toaster } from "sonner";
import EditorPanel from "@cb/components/panel/editor";
import { LoadingPanel } from "@cb/components/panel/LoadingPanel";
import { stateContext } from "@cb/context/StateProvider";
import { State } from "@cb/context/StateProvider";

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
        <button
          className="hover:text-label-1 dark:hover:text-dark-label-1 flex cursor-pointer items-center justify-center rounded-md w-6 h-6 hover:bg-fill-secondary p-1"
          id="headlessui-menu-button-:r3q:"
          type="button"
          aria-haspopup="true"
          aria-expanded="false"
          data-headlessui-state=""
          onClick={() => setDisplayPopup((displayPopup) => !displayPopup)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            fill="currentColor"
            className="hover:text-gray-7 dark:hover:text-dark-gray-7 text-text-secondary dark:text-text-secondary w-4 h-4"
          >
            <path
              fill-rule="evenodd"
              d="M4.4 14a2 2 0 100-4 2 2 0 000 4zm9.6-2a2 2 0 11-4 0 2 2 0 014 0zm7.6 0a2 2 0 11-4 0 2 2 0 014 0z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
      <div className="h-full w-full relative overflow-hidden ">
        <Menu displayMenu={displayPopup} setDisplayMenu={setDisplayPopup} />
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
