import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export const DEFAULT_PANEL_SIZE = 25;

export const COLLAPSED_SIZE = 2;

interface LayoutState {
  extension: {
    width: number;
    collapsed: boolean;
  };
}

const initialState: LayoutState = {
  extension: {
    width: DEFAULT_PANEL_SIZE,
    collapsed: false,
  },
};

const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    collapseExtension: (state) => {
      state.extension.collapsed = true;
      state.extension.width = COLLAPSED_SIZE;
    },
    expandExtension: (state) => {
      state.extension.collapsed = false;
      state.extension.width = DEFAULT_PANEL_SIZE;
    },
    resizeExtension: (state, { payload }: PayloadAction<number>) => {
      state.extension.width = payload;
      state.extension.collapsed = payload < DEFAULT_PANEL_SIZE;
    },
  },
});

export const { collapseExtension, expandExtension, resizeExtension } =
  layoutSlice.actions;

export default layoutSlice.reducer;
