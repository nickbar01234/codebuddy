import { PANEL } from "@cb/constants";
import { BoundStore } from "@cb/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

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
    displayBanner: boolean;
  };
  auth: AuthenticationStatus;
}

interface AppAction {
  toggleEnabledApp: () => void;
  collapseOrExpand: () => void;
  hideBanner: () => void;
  setAppWidth: (width: number) => void;
  authenticate: (user: AppUser) => void;
  unauthenticate: () => void;
  getAuthUser: () => AppUser;
  getMaybeAuthUser: () => AppUser | undefined;
}

export const useApp = create<BoundStore<AppState, AppAction>>()(
  persist(
    immer((set, get) => ({
      app: {
        enabled: true,
        width: PANEL.DEFAULT_WIDTH,
        collapsed: false,
        displayBanner: true,
      },
      auth: {
        status: AppStatus.LOADING,
      },
      actions: {
        toggleEnabledApp: () =>
          set((state) => {
            state.app.enabled = !state.app.enabled;
          }),
        collapseOrExpand: () =>
          set((state) => {
            if (state.app.collapsed) {
              state.app.collapsed = false;
              state.app.width = PANEL.DEFAULT_WIDTH;
            } else {
              state.app.collapsed = true;
              state.app.width = PANEL.COLLAPSED_WIDTH;
            }
          }),
        hideBanner: () =>
          set((state) => {
            state.app.displayBanner = false;
          }),
        setAppWidth: (width) =>
          set((state) => {
            if (state.app.collapsed && width > PANEL.COLLAPSED_WIDTH) {
              state.app.collapsed = false;
              state.app.width = PANEL.DEFAULT_WIDTH;
            } else {
              state.app.collapsed = width < PANEL.DEFAULT_WIDTH;
              state.app.width = state.app.collapsed
                ? PANEL.COLLAPSED_WIDTH
                : width;
            }
          }),
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
          const user = get().actions.getMaybeAuthUser();
          if (user == undefined) {
            throw new Error(
              "Get auth user when status is not authenticated. This is most likely a bug"
            );
          }
          return user;
        },
        getMaybeAuthUser: () => {
          const auth = get().auth;
          if (auth.status === AppStatus.AUTHENTICATED) {
            return auth.user;
          }
          return undefined;
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
