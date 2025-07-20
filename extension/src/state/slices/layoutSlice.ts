import { getLocalStorage } from "@cb/services";
import { createSlice } from "@reduxjs/toolkit";

export const DEFAULT_PANEL_SIZE = 25;

export const COLLAPSED_SIZE = 2;

interface LayoutState {
  app: {
    enabled: boolean;
  };
  extension: {
    width: number;
    collapsed: boolean;
  };
}

const initialState: LayoutState = {
  app: {
    enabled: getLocalStorage("appEnabled") ?? true,
  },
  extension: {
    width: DEFAULT_PANEL_SIZE,
    collapsed: false,
  },
};

const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    toggleEnabledApp: (state) => {
      state.app.enabled = !state.app.enabled;
    },
    collapseExtension: (state) => {
      state.extension.collapsed = true;
      state.extension.width = COLLAPSED_SIZE;
    },
    expandExtension: (state) => {
      state.extension.collapsed = false;
      state.extension.width = DEFAULT_PANEL_SIZE;
    },
  },
});

export const { collapseExtension, expandExtension, toggleEnabledApp } =
  layoutSlice.actions;

export default layoutSlice.reducer;
