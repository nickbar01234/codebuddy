import React from "react";
import { RTCContext } from "@cb/context/RTCProvider";
import { appStateContext } from "@cb/context/AppStateProvider";

export const useRTC = () => React.useContext(RTCContext);

export const useAppState = () => React.useContext(appStateContext);

export const useOnMount = (effect: React.EffectCallback) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(effect, []);

export * from "@cb/hooks/useTab";
