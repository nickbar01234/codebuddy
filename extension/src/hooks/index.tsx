import { PeerSelectionContext } from "@cb/context/PeerSelectionProvider";
import React from "react";
import { useFirebaseListener } from "./useFirebaseListener";
import { useOnMount } from "./useOnMount";

export const usePeerSelection = () => React.useContext(PeerSelectionContext);

export { useFirebaseListener, useOnMount };
