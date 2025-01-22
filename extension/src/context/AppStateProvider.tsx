import { User } from "@cb/types";
import React from "react";

enum AppState {
  HOME, // Home screen
  ROOM, // In-room
}

interface AppStateProviderProps {
  children?: React.ReactNode;
  user: User;
}

interface AppStateContext {
  user: User;
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  navigationEntry: string;
}

const appStateContext = React.createContext({} as AppStateContext);

const Provider = appStateContext.Provider;

export const AppStateProvider = (props: AppStateProviderProps) => {
  const { children, user } = props;
  const [state, setState] = React.useState(AppState.HOME);

  return (
    <Provider
      value={{
        user: user,
        state: state,
        setState: setState,
        navigationEntry: (
          performance.getEntriesByType(
            "navigation"
          )[0] as PerformanceNavigationTiming
        ).type,
      }}
    >
      {children}
    </Provider>
  );
};

export { appStateContext, AppState };
