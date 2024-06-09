import React from "react";
import { useContext } from "react";
import { RTCContext } from "@cb/context/RTCProvider";

export const useRTC = () => {
  const rtc = useContext(RTCContext);
  return rtc;
};

export const useOnMount = (effect: React.EffectCallback) =>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(effect, []);
