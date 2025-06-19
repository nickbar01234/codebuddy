import { CodeBuddyPreference } from "@cb/constants";
import { useOnMount } from "@cb/hooks";
import { getLocalStorage, setLocalStorage } from "@cb/services";
import { Preference } from "@cb/types";
import React, { createContext } from "react";

interface WindowContext {
  width: number;
  height: number;
  preference: Preference;
  setAppWidth: (width: number) => void;
  setCodePreferenceHeight: (height: number) => void;
  onResizeStop: () => void;
  toggleWidth: () => void;
}

export const windowContext = createContext({} as WindowContext);

const Provider = windowContext.Provider;

export const MIN_WIDTH = 40;

const getWindowDimensions = () => {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
};

export const WindowProvider = (props: { children?: React.ReactNode }) => {
  const [windowDimensions, setWindowDimensions] = React.useState(
    getWindowDimensions()
  );
  const { width, height } = windowDimensions;
  const windowDimensionsRef = React.useRef(windowDimensions);

  const [preference, setPreference] = React.useState(CodeBuddyPreference);

  const toggleWidth = () => {
    setPreference((prev) => {
      const updated = {
        ...prev,
        appPreference: {
          ...prev.appPreference,
          isCollapsed: !prev.appPreference.isCollapsed,
        },
      };
      setLocalStorage("preference", updated);
      return updated;
    });
  };

  React.useEffect(() => {
    setPreference((prev) => {
      const oldRatio =
        prev.appPreference.width / windowDimensionsRef.current.width;
      return {
        ...prev,
        appPreference: {
          width: width * oldRatio,
          isCollapsed: width * oldRatio <= MIN_WIDTH,
        },
      };
    });
    windowDimensionsRef.current.width = width;
  }, [width]);

  React.useEffect(() => {
    setPreference((prev) => {
      const oldRatio =
        prev.codePreference.height / windowDimensionsRef.current.height;
      return {
        ...prev,
        codePreference: {
          height: height * oldRatio,
        },
      };
    });
    windowDimensionsRef.current.height = height;
  }, [height]);

  useOnMount(() => {
    const preference = getLocalStorage("preference");
    if (preference != undefined) {
      setPreference(preference);
    }
  });

  useOnMount(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  });

  return (
    <Provider
      value={{
        height: windowDimensions.height,
        width: windowDimensions.width,
        preference,
        setAppWidth: (width) =>
          setPreference((prev) => ({
            ...prev,
            appPreference: {
              width: width,
              isCollapsed: width <= MIN_WIDTH,
            },
          })),
        setCodePreferenceHeight: (height) =>
          setPreference((prev) => ({
            ...prev,
            codePreference: {
              height: height,
            },
          })),
        onResizeStop: () => setLocalStorage("preference", preference),
        toggleWidth,
      }}
    >
      {props.children}
    </Provider>
  );
};
