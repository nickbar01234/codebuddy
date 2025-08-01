import { appStateContext } from "@cb/context/AppStateProvider";
import { PeerSelectionContext } from "@cb/context/PeerSelectionProvider";
import { RTCContext } from "@cb/context/RTCProvider";
import React from "react";
import { useFirebaseListener } from "./useFirebaseListener";
import { useOnMount } from "./useOnMount";

export const useRTC = () => React.useContext(RTCContext);

export const usePeerSelection = () => React.useContext(PeerSelectionContext);

export const useAppState = () => React.useContext(appStateContext);

export { useFirebaseListener, useOnMount };
