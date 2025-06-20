// src/store/slices/windowSlice.ts
import { CodeBuddyPreference } from "@cb/constants";
import { Preference } from "@cb/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface WindowState {
  browser: {
    width: number;
    height: number;
  };
  preference: Preference;
}

export const MIN_WIDTH = 40;

const getInitialBrowserDimension = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return { width, height };
};

const getInitialPreference = (): Preference => {
  const stored = localStorage.getItem("preference");
  return stored ? JSON.parse(stored) : CodeBuddyPreference;
};

const initialState: WindowState = {
  browser: getInitialBrowserDimension(),
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
      }>
    ) => {
      const { width, height } = action.payload;
      const widthRatio =
        state.preference.appPreference.width / state.browser.width;
      const heightRatio =
        state.preference.codePreference.height / state.browser.height;

      state.preference.appPreference.width = width * widthRatio;
      state.preference.appPreference.isCollapsed =
        state.preference.appPreference.width <= MIN_WIDTH;
      state.preference.codePreference.height = height * heightRatio;
      state.browser = action.payload;
    },
    setAppWidth: (state, action: PayloadAction<number>) => {
      state.preference.appPreference.width =
        action.payload < MIN_WIDTH ? MIN_WIDTH : action.payload;
      state.preference.appPreference.isCollapsed =
        state.preference.appPreference.width <= MIN_WIDTH;
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
