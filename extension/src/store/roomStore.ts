import { PeerInformation } from "@cb/types";
import { createStore } from "zustand";
import { immer } from "zustand/middleware/immer";
import { MutableState } from "./type";

export enum RoomStatus {
  HOME,
  IN_ROOM,
  LOADING,
  REJOINING,
}

interface HomeState {
  status: RoomStatus.HOME;
}

interface InRoomState {
  status: RoomStatus.IN_ROOM;
  id: string;
  public: boolean;
  name: string;
  peers: Record<string, PeerInformation>;
}

interface LoadingState {
  status: RoomStatus.LOADING;
}

interface RejoiningState {
  status: RoomStatus.REJOINING;
}

interface RoomState {
  room: HomeState | InRoomState | LoadingState | RejoiningState;
}

interface RoomAction {
  createRoom: (args: { id: string; public: boolean; name: string }) => void;
  leaveRoom: () => void;
  loadingRoom: () => void;
  rejoiningRoom: () => void;
  homeRoom: () => void;
}

type RoomStore = MutableState<RoomState, RoomAction>;

export const roomStore = createStore<RoomStore>()(
  immer((set) => ({
    room: {
      // todo(nickbar01234): Make this loading on startup?
      status: RoomStatus.HOME,
    },
    actions: {
      createRoom: (args) =>
        set((state) => {
          state.room = {
            ...args,
            status: RoomStatus.IN_ROOM,
            peers: {},
          };
        }),
      leaveRoom: () =>
        set((state) => {
          state.room = {
            status: RoomStatus.HOME,
          };
        }),
      loadingRoom: () =>
        set((state) => {
          state.room = {
            status: RoomStatus.LOADING,
          };
        }),
      rejoiningRoom: () =>
        set((state) => {
          state.room = {
            status: RoomStatus.REJOINING,
          };
        }),
      homeRoom: () =>
        set((state) => {
          state.room = {
            status: RoomStatus.HOME,
          };
        }),
    },
  }))
);
