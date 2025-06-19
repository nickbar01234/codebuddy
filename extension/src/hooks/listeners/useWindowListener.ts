import { setWindowDimensions } from "@cb/state/slices/windowSlice";
import { AppDispatch } from "@cb/state/store";
import { loadPreference } from "@cb/state/thunks/windowThunks";
import React from "react";
import { useDispatch } from "react-redux";

export const useWindowListener = () => {
  const dispatch = useDispatch<AppDispatch>();

  const prev = React.useRef({ w: window.innerWidth, h: window.innerHeight });

  React.useEffect(() => {
    dispatch(loadPreference());

    const handleResize = () => {
      const { innerWidth: w, innerHeight: h } = window;
      dispatch(
        setWindowDimensions({
          width: w,
          height: h,
          prevW: prev.current.w,
          prevH: prev.current.h,
        })
      );
      prev.current = { w, h };
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
