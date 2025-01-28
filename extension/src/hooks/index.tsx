import React from "react";
import { RTCContext } from "@cb/context/RTCProvider";
import { appStateContext } from "@cb/context/AppStateProvider";
import { PeerSelectionContext } from "@cb/context/PeerSelectionProvider";
import { windowContext } from "@cb/context/WindowProvider";

export const useRTC = () => React.useContext(RTCContext);

export const usePeerSelection = () => React.useContext(PeerSelectionContext);

export const useAppState = () => React.useContext(appStateContext);

export const useOnMount = (effect: React.EffectCallback) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(effect, []);

export const useWindowDimensions = () => React.useContext(windowContext);
