import React from "react";
import { RTCContext } from "@cb/context/RTCProvider";
import { stateContext } from "@cb/context/StateProvider";

export const useRTC = () => React.useContext(RTCContext);

export const useState = () => React.useContext(stateContext);

export const useOnMount = (effect: React.EffectCallback) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(effect, []);
