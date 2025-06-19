import { useAppDispatch } from "@cb/hooks/redux";
import { setWindowDimensions } from "@cb/state/slices/windowSlice";
import { loadPreference } from "@cb/state/thunks/windowThunks";
import React from "react";

export const useWindowListener = () => {
  const dispatch = useAppDispatch();

  React.useEffect(() => {
    dispatch(loadPreference());

    const handleResize = () => {
      const { innerWidth: w, innerHeight: h } = window;
      dispatch(
        setWindowDimensions({
          width: w,
          height: h,
        })
      );
    };

    // throttle with requestAnimationFrame so we don’t dispatch on every pixel
    let ticking = false;
    const onResize = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleResize();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [dispatch]);
};
