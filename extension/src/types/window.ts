import { GenericMessage, LeetCodeContentChange } from "./utils";

interface LeetCodeOnChangeMessage extends GenericMessage {
  action: "leetCodeOnChange";
  changes: LeetCodeContentChange;
}

interface RoomMessage {
  roomId: string;
}

interface CreateRoomMessage extends RoomMessage, GenericMessage {
  action: "createRoom";
}

interface JoinRoomMessage extends RoomMessage, GenericMessage {
  action: "joinRoom";
}

interface ReloadExtension extends GenericMessage {
  action: "reloadExtension";
}

export type WindowMessage =
  | LeetCodeOnChangeMessage
  | CreateRoomMessage
  | JoinRoomMessage
  | ReloadExtension;
