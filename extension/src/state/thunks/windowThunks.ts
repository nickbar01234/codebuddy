import { setPreference, toggleWidth } from "../slices/windowSlice";
import { AppDispatch, RootState } from "../store";

export const toggleWidthAndSave =
  () => (dispatch: AppDispatch, getState: () => RootState) => {
    dispatch(toggleWidth());
    const pref = getState().window.preference;
    localStorage.setItem("preference", JSON.stringify(pref));
  };

export const savePreferenceNow =
  () => (dispatch: AppDispatch, getState: () => RootState) => {
    const pref = getState().window.preference;
    localStorage.setItem("preference", JSON.stringify(pref));
  };

export const loadPreference = () => (dispatch: AppDispatch) => {
  try {
    const pref = localStorage.getItem("preference");
    if (pref) {
      dispatch(setPreference(JSON.parse(pref)));
    }
  } catch {
    // fallback silently if localStorage fails
  }
};
