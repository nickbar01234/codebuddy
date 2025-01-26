import { CodeBuddyPreference } from "@cb/constants";
import { useOnMount } from "@cb/hooks";
import { getChromeStorage, setChromeStorage } from "@cb/services";
import { ExtensionStorage } from "@cb/types";
import React, { createContext } from "react";

interface WindowContext {
  width: number;
  height: number;
  appPreference: ExtensionStorage["appPreference"];
  setAppWidth: (width: number) => void;
  codePreference: ExtensionStorage["codePreference"];
  setCodePreferenceHeight: (height: number) => void;
  onResizeStop: () => void;
  toggle: () => void;
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

  const [appPreference, setAppPreference] = React.useState<
    ExtensionStorage["appPreference"]
  >(CodeBuddyPreference.appPreference);
  const [codePreference, setCodePreference] = React.useState<
    ExtensionStorage["codePreference"]
  >(CodeBuddyPreference.codePreference);

  const { width, height } = windowDimensions;
  const prevWidth = React.useRef(width);
  const prevHeight = React.useRef(height);
  const toggle = () => {
    setAppPreference((prev) => ({
      ...prev,
      isCollapsed: !prev.isCollapsed,
    }));
    setChromeStorage({
      appPreference: {
        ...appPreference,
        isCollapsed: appPreference.isCollapsed,
      },
      codePreference,
    });
  };
  React.useEffect(() => {
    const oldRatio = appPreference.width / prevWidth.current;
    // console.log("resizing", width, appPreference.width, oldRatio);
    setAppPreference((prev) => ({
      ...prev,
      width: width * oldRatio,
      isCollapsed: width * oldRatio <= MIN_WIDTH,
    }));
    prevWidth.current = width;
  }, [width, appPreference.width]);

  React.useEffect(() => {
    const oldRatio = codePreference.height / prevHeight.current;
    // console.log("resizing", height, codePreference.height, oldRatio);
    setCodePreference((prev) => ({
      ...prev,
      height: height * oldRatio,
    }));
    prevHeight.current = height;
  }, [height, codePreference.height]);

  useOnMount(() => {
    getChromeStorage("appPreference").then(setAppPreference);
    getChromeStorage("codePreference").then(setCodePreference);
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
        appPreference: appPreference,
        setAppWidth: (width) =>
          setAppPreference((prev) => ({
            ...prev,
            width: width,
            isCollapsed: width <= MIN_WIDTH,
          })),
        codePreference: codePreference,
        setCodePreferenceHeight: (height) =>
          setCodePreference((prev) => ({
            ...prev,
            height: height,
          })),
        onResizeStop: () => setChromeStorage({ appPreference, codePreference }),
        toggle,
      }}
    >
      {props.children}
    </Provider>
  );
};
