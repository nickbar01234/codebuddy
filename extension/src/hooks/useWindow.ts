import {
  setAppWidth as _setAppWidth,
  setCodePreferenceHeight as _setCodePreferenceHeight,
} from "@cb/state/slices/windowSlice";
import type { RootState } from "@cb/state/store";
import {
  savePreferenceNow,
  toggleWidthAndSave,
} from "@cb/state/thunks/windowThunks";
import { useAppDispatch, useAppSelector } from "./redux";

export function useWindow() {
  const dispatch = useAppDispatch();
  const { width, height, preference } = useAppSelector(
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
