import { User } from "./db";

export type IamPolite = (me: User, other: User) => boolean;

export enum RecoveryState {
  IDLE = "idle",
  RECOVERY_REQUESTED = "recovery-requested",
  RECOVERY_ACKNOWLEDGED = "recovery-acknowledged",
}

export interface PeerConnection {
  pc: RTCPeerConnection;
  channel: RTCDataChannel;
  makingOffer: boolean;
  isSettingRemoteAnswerPending: boolean;
  ignoreOffer: boolean;
  recoveryState: RecoveryState;
  recoveryRequestId?: string;
  recoveryTimeout?: NodeJS.Timeout;
}
