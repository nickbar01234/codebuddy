import { Timestamp } from "firebase/firestore";
import { Room, User } from "./db";
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

interface UserDisconnectedEvent {
  user: User;
}

interface NegotiationEvent {
  joinedAt?: Timestamp;
}

export type Events = {
  "rtc.ice": AddressableEvent<RTCIceCandidateInit | null>;
  "rtc.description": AddressableEvent<RTCSessionDescriptionInit> &
    NegotiationEvent;
  "rtc.renegotiation.request": AddressableEvent<void> & NegotiationEvent;
  "rtc.renegotiation.start": AddressableEvent<void> & NegotiationEvent;
  "rtc.open": ChannelOpenEvent;
  "rtc.send.message": SendMessageEvent;
  "rtc.receive.message": ReceiveMessageEvent;
  "rtc.error.connection": RtcConnectionError;
  "rtc.user.disconnected": UserDisconnectedEvent;

  "room.changes": RoomEvent;
  "room.left": void;
};
