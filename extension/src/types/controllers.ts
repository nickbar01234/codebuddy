import { RoomLifeCycle } from "@cb/services/controllers/RoomController";
import { ResponseStatus } from "./services";

interface ControllerGenericResponse {
  status: ResponseStatus;
}

export enum RoomJoinError {
  ROOM_NOT_FOUND = "ROOM_NOT_FOUND",
  ROOM_FULL = "ROOM_FULL",
}

interface RoomJoinSuccessResponse extends ControllerGenericResponse {
  status: ResponseStatus.SUCCESS;
  room: RoomLifeCycle;
}

interface RoomJoinFailureResponse extends ControllerGenericResponse {
  status: ResponseStatus.FAIL;
  error: RoomJoinError;
}

export type RoomJoinResponse =
  | RoomJoinSuccessResponse
  | RoomJoinFailureResponse;
