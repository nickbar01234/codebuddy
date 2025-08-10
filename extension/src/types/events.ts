import { Emitter } from "mitt";
import { Room, User } from "./db";

export interface AddressableEvent<T> {
  from: User;
  to: User;
  data: T;
}

interface RoomChanges {
  room: Room;
  joined: User[];
  left: User[];
}

export type Events = {
  "rtc.ice": AddressableEvent<RTCIceCandidateInit | null>;
  "rtc.description": AddressableEvent<RTCSessionDescriptionInit>;
  "room.user.changes": RoomChanges;
};

export type EventEmitter = Emitter<Events>;
