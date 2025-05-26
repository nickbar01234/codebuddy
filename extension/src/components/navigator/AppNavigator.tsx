import EditorPanel from "@cb/components/panel/editor";
import { LoadingPanel } from "@cb/components/panel/LoadingPanel";
import { appStateContext } from "@cb/context/AppStateProvider";
import useDevSetupRoom from "@cb/hooks/useDevSetupRoom";
import { getLocalStorage } from "@cb/services";
import { getSessionId } from "@cb/utils";
import React from "react";

export const AppNavigator = () => {
  const { state } = React.useContext(appStateContext);
  useDevSetupRoom();

  const currentTabInfo = getLocalStorage("tabs");

  return (
    <div className="relative h-full w-full overflow-hidden bg-secondary">
      <div className="absolute inset-0 flex h-full w-full items-center justify-center mx-2">
        <LoadingPanel
          numberOfUsers={
            Object.keys(currentTabInfo?.sessions[getSessionId()]?.peers ?? {})
              .length
          }
        />
      </div>

      <EditorPanel />
    </div>
  );
};
