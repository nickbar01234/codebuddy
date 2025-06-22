import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { NumberSize } from "re-resizable";

interface LayoutState {
  extension: {
    collapsed: boolean;
    width: number;
    transition: boolean;
  };
}

interface ResizeExtensionPayload {
  size: NumberSize;
  delta: NumberSize;
}

export const DEFAULT_PANEL_WIDTH = 360;

export const COLLAPSED_PANEL_WIDTH = 40;

const initialState: LayoutState = {
  extension: {
    collapsed: false,
    width: DEFAULT_PANEL_WIDTH,
    transition: false,
  },
};

const layoutSlice = createSlice({
  name: "layout",
  initialState,
  reducers: {
    resizeExtension: (state, action: PayloadAction<ResizeExtensionPayload>) => {
      const { size, delta } = action.payload;
      const expandFromCollapsed = state.extension.collapsed && delta.width > 0;
      console.log(
        "Resize extension",
        expandFromCollapsed,
        state.extension.collapsed,
        state.extension.width,
        size,
        delta
      );
      state.extension.collapsed = expandFromCollapsed
        ? false
        : size.width < DEFAULT_PANEL_WIDTH;
      state.extension.width = expandFromCollapsed
        ? DEFAULT_PANEL_WIDTH
        : state.extension.collapsed
          ? COLLAPSED_PANEL_WIDTH
          : size.width;
      state.extension.transition =
        expandFromCollapsed || state.extension.collapsed;
    },
    endTransition: (state) => {
      state.extension.transition = false;
    },
  },
});

export const { resizeExtension, endTransition } = layoutSlice.actions;

export default layoutSlice.reducer;
