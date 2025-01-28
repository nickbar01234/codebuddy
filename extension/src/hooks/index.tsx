import React from "react";
import { RTCContext } from "@cb/context/RTCProvider";
import { appStateContext } from "@cb/context/AppStateProvider";
import { PeerSelectionContext } from "@cb/context/PeerSelectionProvider";
import { windowContext } from "@cb/context/WindowProvider";
import { sessionContext } from "@cb/context/SessionProvider";

export const useRTC = () => React.useContext(RTCContext);

export const usePeerSelection = () => React.useContext(PeerSelectionContext);

export const useAppState = () => React.useContext(appStateContext);

export const useSession = () => React.useContext(sessionContext);

export const useOnMount = (effect: React.EffectCallback) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(effect, []);

export const useWindowDimensions = () => React.useContext(windowContext);
