import { appStateContext } from "@cb/context/AppStateProvider";
import { PeerSelectionContext } from "@cb/context/PeerSelectionProvider";
import { RTCContext } from "@cb/context/RTCProvider";
import { sessionContext } from "@cb/context/SessionProvider";
import { AppDispatch, RootState } from "@cb/state/store";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useFirebaseListener } from "./useFirebaseListener";
import { useOnMount } from "./useOnMount";

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();

export const useAppSelector = useSelector.withTypes<RootState>();

export const useRTC = () => React.useContext(RTCContext);

export const usePeerSelection = () => React.useContext(PeerSelectionContext);

export const useAppState = () => React.useContext(appStateContext);

export const useSession = () => React.useContext(sessionContext);

export { useFirebaseListener, useOnMount };
