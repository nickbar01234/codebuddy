import { Room, User } from "./db";
import type {
  PeerRecoveryAckMessage,
  PeerRecoveryRequestMessage,
} from "./peers";
import { PeerMessage } from "./peers";

export interface AddressableEvent<T> {
  from: User;
  to: User;
  data: T;
}

interface RoomEvent {
  room: Room;
  joined: User[];
  left: User[];
}

interface ChannelOpenEvent {
  user: User;
}

interface SendMessageEvent {
  to?: User;
  message: PeerMessage;
}

interface ReceiveMessageEvent {
  from: User;
  message: PeerMessage;
}

interface RtcConnectionError {
  user: User;
}

interface RtcRecoveryInitiated {
  user: User;
  reason: string;
}

interface RtcRecoveryRequestEvent {
  from: User;
  message: PeerRecoveryRequestMessage;
}

interface RtcRecoveryAckEvent {
  from: User;
  message: PeerRecoveryAckMessage;
}

export type Events = {
  "rtc.ice": AddressableEvent<RTCIceCandidateInit | null>;
  "rtc.description": AddressableEvent<RTCSessionDescriptionInit>;
  "rtc.open": ChannelOpenEvent;
  "rtc.send.message": SendMessageEvent;
  "rtc.receive.message": ReceiveMessageEvent;
  "rtc.error.connection": RtcConnectionError;
  "rtc.recovery": AddressableEvent<
    PeerRecoveryRequestMessage | PeerRecoveryAckMessage
  >;
  "rtc.recovery.request": RtcRecoveryRequestEvent;
  "rtc.recovery.ack": RtcRecoveryAckEvent;
  "rtc.recovery.initiated": RtcRecoveryInitiated;

  "room.changes": RoomEvent;
  "room.left": void;
};
