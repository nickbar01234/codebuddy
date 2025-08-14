import { User } from "./db";

export type IamPolite = (me: User, other: User) => boolean;

export interface PeerConnection {
  pc: RTCPeerConnection;
  channel: RTCDataChannel;
  makingOffer: boolean;
  isSettingRemoteAnswerPending: boolean;
  ignoreOffer: boolean;
}
