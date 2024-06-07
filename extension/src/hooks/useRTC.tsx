import { useContext } from "react";
import { RTCContext } from "../context/RTCProvider";

export const useRTC = () => {
  const rtc = useContext(RTCContext);
  return rtc;
};
