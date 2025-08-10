import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { MutableState } from "./type";

export const DEFAULT_PANEL_SIZE = 25;

export const COLLAPSED_SIZE = 2;

const APP_STORAGE = "CODEBUDDY_APP";

export enum AppStatus {
  AUTHENTICATED,
  UNAUTHENTICATED,
  LOADING,
}

export interface AppUser {
  username: string;
}

interface Authenticated {
  status: AppStatus.AUTHENTICATED;
  user: AppUser;
}

interface Unauthenticated {
  status: AppStatus.UNAUTHENTICATED;
}

interface Loading {
  status: AppStatus.LOADING;
}

export type AuthenticationStatus = Authenticated | Unauthenticated | Loading;

interface AppState {
  app: {
    enabled: boolean;
    width: number;
    collapsed: boolean;
  };
  auth: AuthenticationStatus;
}

interface AppAction {
  toggleEnabledApp: () => void;
  collapseExtension: () => void;
  expandExtension: () => void;
  setAppWidth: (width: number) => void;
  authenticate: (user: AppUser) => void;
  unauthenticate: () => void;
}

type _AppStore = MutableState<AppState, AppAction>;

export const useApp = create<_AppStore>()(
  persist(
    immer((set) => ({
      app: {
        enabled: true,
        width: DEFAULT_PANEL_SIZE,
        collapsed: false,
      },
      auth: {
        status: AppStatus.LOADING,
      },
      actions: {
        toggleEnabledApp: () =>
          set((state) => {
            state.app.enabled = !state.app.enabled;
          }),
        collapseExtension: () =>
          set((state) => {
            state.app.collapsed = true;
            state.app.width = COLLAPSED_SIZE;
          }),
        expandExtension: () =>
          set((state) => {
            state.app.collapsed = false;
            state.app.width = DEFAULT_PANEL_SIZE;
          }),
        setAppWidth: (width) =>
          set((state) => {
            state.app.width = width;
          }),
        authenticate: (user: AppUser) => {
          set((state) => {
            state.auth = {
              status: AppStatus.AUTHENTICATED,
              user,
            };
          });
        },
        unauthenticate: () =>
          set((state) => {
            state.auth = { status: AppStatus.UNAUTHENTICATED };
          }),
      },
    })),
    {
      name: APP_STORAGE,
      partialize: (state) => {
        const { app } = state;
        return { ...app };
      },
    }
  )
);

export type AppStore = typeof useApp;
