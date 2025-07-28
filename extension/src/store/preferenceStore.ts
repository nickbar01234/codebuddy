import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { MutableState } from "./type";

export const DEFAULT_PANEL_SIZE = 25;

export const COLLAPSED_SIZE = 2;

const PREFERENCE_STORAGE = "CODEBUDDY_PREFERENCE";

interface PreferenceState {
  app: {
    enabled: boolean;
    width: number;
    collapsed: boolean;
  };
}

interface PreferenceAction {
  toggleEnabledApp: () => void;
  collapseExtension: () => void;
  expandExtension: () => void;
  setAppWidth: (width: number) => void;
}

type PreferenceStore = MutableState<PreferenceState, PreferenceAction>;

export const usePreference = create<PreferenceStore>()(
  persist(
    immer((set) => ({
      app: {
        enabled: true,
        width: DEFAULT_PANEL_SIZE,
        collapsed: false,
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
      },
    })),
    {
      name: PREFERENCE_STORAGE,
      partialize: (state) => {
        const { actions, ...rest } = state;
        return rest;
      },
    }
  )
);
