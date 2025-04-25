import { useOnMount } from "@cb/hooks";
import {
  getLocalStorage,
  removeLocalStorage,
  setLocalStorage,
} from "@cb/services";
import { AppUser } from "@cb/types";
import React from "react";

enum AppState {
  HOME, // Home screen
  ROOM, // In-room
  JOIN_ROOMS,
  LOADING,
  REJOINING,
}

interface AppStateProviderProps {
  children?: React.ReactNode;
  user: AppUser;
}

interface AppStateContext {
  user: AppUser;
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const appStateContext = React.createContext({} as AppStateContext);

const Provider = appStateContext.Provider;

export const AppStateProvider = (props: AppStateProviderProps) => {
  const { children, user } = props;
  const [state, setState] = React.useState(AppState.HOME);

  useOnMount(() => {
    const refreshInfo = getLocalStorage("tabs");
    const maybeReload = performance.getEntriesByType(
      "navigation"
    )[0] as PerformanceNavigationTiming;
    const navigate = getLocalStorage("navigate") == "true";
    const closingTabs = getLocalStorage("closingTabs");
    removeLocalStorage("navigate");
    if (refreshInfo?.roomId)
      if ((maybeReload.type === "reload" || navigate) && !closingTabs) {
        setState(AppState.LOADING);
      } else {
        setLocalStorage("closingTabs", true);
        setState(AppState.REJOINING);
      }
  });

  return (
    <Provider
      value={{
        user: user,
        state: state,
        setState: setState,
      }}
    >
      {children}
    </Provider>
  );
};

export { AppState, appStateContext };
