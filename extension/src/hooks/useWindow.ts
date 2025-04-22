// src/hooks/useWindow.ts

import {
  setAppWidth as _setAppWidth,
  setCodePreferenceHeight as _setCodePreferenceHeight,
} from "@cb/state/slices/windowSlice";
import type { AppDispatch, RootState } from "@cb/state/store";
import {
  savePreferenceNow,
  toggleWidthAndSave,
} from "@cb/state/thunks/windowThunks";
import { useDispatch, useSelector } from "react-redux";

export function useWindow() {
  const dispatch = useDispatch<AppDispatch>();
  const { width, height, preference } = useSelector(
    (state: RootState) => state.window
  );

  return {
    width,
    height,
    preference,

    setAppWidth: (w: number) => {
      dispatch(_setAppWidth(w));
    },

    setCodePreferenceHeight: (h: number) => {
      dispatch(_setCodePreferenceHeight(h));
    },

    toggleWidth: () => {
      dispatch(toggleWidthAndSave());
    },

    onResizeStop: () => {
      dispatch(savePreferenceNow());
    },
  };
}
