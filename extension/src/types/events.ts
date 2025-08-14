import { Emitter } from "mitt";
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

export type Events = {
  "rtc.ice": AddressableEvent<RTCIceCandidateInit | null>;
  "rtc.description": AddressableEvent<RTCSessionDescriptionInit>;
  "rtc.open": ChannelOpenEvent;
  "rtc.send.message": SendMessageEvent;
  "rtc.receive.message": ReceiveMessageEvent;

  "room.changes": RoomEvent;
  "room.left": void;
};

export type EventEmitter = Emitter<Events>;
