import { BoundStore } from "@cb/types";
import _ from "lodash";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

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
  getAuthUser: () => AppUser;
}

export const useApp = create<BoundStore<AppState, AppAction>>()(
  persist(
    immer((set, get) => ({
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
          _.debounce(
            () =>
              set((state) => {
                state.app.width = width;
              }),
            1000
          ),
        authenticate: (user: AppUser) =>
          set((state) => {
            state.auth = {
              status: AppStatus.AUTHENTICATED,
              user,
            };
          }),
        unauthenticate: () =>
          set((state) => {
            state.auth = { status: AppStatus.UNAUTHENTICATED };
          }),
        getAuthUser: () => {
          const auth = get().auth;
          if (auth.status != AppStatus.AUTHENTICATED) {
            throw new Error(
              "Get auth user when status is not authenticated. This is most likely a bug"
            );
          }
          return auth.user;
        },
      },
    })),
    {
      name: APP_STORAGE,
      partialize: (state) => ({ app: state.app }),
    }
  )
);

export type AppStore = typeof useApp;
