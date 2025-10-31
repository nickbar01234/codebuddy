import { Timestamp } from "firebase/firestore";
import { User } from "./db";

export type IamPolite = (me: User, other: User) => boolean;

export enum RestartState {
  IDLE = "idle",
  RESTARTING = "restarting",
}

export interface PeerConnection {
  pc: RTCPeerConnection;
  channel: RTCDataChannel;
  makingOffer: boolean;
  isSettingRemoteAnswerPending: boolean;
  ignoreOffer: boolean;
  joinedAt: Timestamp;
  restartState: RestartState;
}
