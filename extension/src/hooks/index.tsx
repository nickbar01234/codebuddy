import { appStateContext } from "@cb/context/AppStateProvider";
import { PeerSelectionContext } from "@cb/context/PeerSelectionProvider";
import { RTCContext } from "@cb/context/RTCProvider";
import { sessionContext } from "@cb/context/SessionProvider";
import { windowContext } from "@cb/context/WindowProvider";
import React from "react";
import { useOnMount } from "./useOnMount";

export const useRTC = () => React.useContext(RTCContext);

export const usePeerSelection = () => React.useContext(PeerSelectionContext);

export const useAppState = () => React.useContext(appStateContext);

export const useSession = () => React.useContext(sessionContext);

export const useWindowDimensions = () => React.useContext(windowContext);

export { useOnMount };
