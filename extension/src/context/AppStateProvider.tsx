import { User } from "@cb/types";
import React from "react";
import { getLocalStorage } from "@cb/services";
import { useOnMount } from "@cb/hooks";

enum AppState {
  HOME, // Home screen
  ROOM, // In-room
  LOADING,
  REJOINING,
}

interface AppStateProviderProps {
  children?: React.ReactNode;
  user: User;
}

interface AppStateContext {
  user: User;
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

    if (refreshInfo?.roomId)
      setState(
        maybeReload.type === "reload" ? AppState.LOADING : AppState.REJOINING
      );
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

export { appStateContext, AppState };
