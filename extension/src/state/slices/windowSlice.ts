// src/store/slices/windowSlice.ts
import { CodeBuddyPreference } from "@cb/constants";
import { Preference } from "@cb/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WindowState {
  width: number;
  height: number;
  preference: Preference;
}

const MIN_WIDTH = 40;

const getInitialWindowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return { width, height };
};

const getInitialPreference = (): Preference => {
  const stored = localStorage.getItem("preference");
  return stored ? JSON.parse(stored) : CodeBuddyPreference;
};

const initialState: WindowState = {
  ...getInitialWindowDimensions(),
  preference: getInitialPreference(),
};

export const windowSlice = createSlice({
  name: "window",
  initialState,
  reducers: {
    setWindowDimensions: (
      state,
      action: PayloadAction<{
        width: number;
        height: number;
        prevW: number;
        prevH: number;
      }>
    ) => {
      const { width, height, prevW, prevH } = action.payload;
      const widthRatio = state.preference.appPreference.width / prevW;
      const heightRatio = state.preference.codePreference.height / prevH;

      state.preference.appPreference.width = width * widthRatio;
      state.preference.appPreference.isCollapsed =
        state.preference.appPreference.width <= MIN_WIDTH;
      state.preference.codePreference.height = height * heightRatio;

      state.width = width;
      state.height = height;
    },
    setAppWidth: (state, action: PayloadAction<number>) => {
      state.preference.appPreference.width = action.payload;
      state.preference.appPreference.isCollapsed = action.payload <= MIN_WIDTH;
    },
    setCodePreferenceHeight: (state, action: PayloadAction<number>) => {
      state.preference.codePreference.height = action.payload;
    },
    toggleWidth: (state) => {
      state.preference.appPreference.isCollapsed =
        !state.preference.appPreference.isCollapsed;
    },
    setPreference: (state, action: PayloadAction<Preference>) => {
      state.preference = action.payload;
    },
  },
});

export const {
  setWindowDimensions,
  setAppWidth,
  setCodePreferenceHeight,
  toggleWidth,
  setPreference,
} = windowSlice.actions;

export default windowSlice.reducer;
