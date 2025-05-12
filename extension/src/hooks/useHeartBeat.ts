import { HeartBeatContext } from "@cb/context/HeartBeatProvider";
import React from "react";

export const useHeartBeat = () => React.useContext(HeartBeatContext);
