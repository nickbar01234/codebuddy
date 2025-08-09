import { RoomLifeCycleController } from "@cb/services/controller/RoomLifeCycleController";
import { PeerState } from "@cb/types";
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
  peers: Record<string, PeerState>;
}

interface LoadingState {
  status: RoomStatus.LOADING;
}

interface RejoiningState {
  status: RoomStatus.REJOINING;
}

export interface RoomState {
  room: HomeState | InRoomState | LoadingState | RejoiningState;
}

interface RoomAction {
  createRoom: (
    room: { public: boolean; name: string },
    username: string
  ) => Promise<void>;
  joinRoom: (id: string, username: string) => Promise<void>;
  leaveRoom: () => void;
  loadingRoom: () => void;
  rejoiningRoom: () => void;
  homeRoom: () => void;
  updatePeer: (id: string, peer: Partial<PeerState>) => void;
  removePeers: (ids: string[]) => void;
}

type RoomStore = MutableState<RoomState, RoomAction>;

export const roomStore = createStore<RoomStore>()(
  immer((set, get) => ({
    room: {
      // todo(nickbar01234): Make this loading on startup?
      status: RoomStatus.HOME,
    },
    actions: {
      createRoom: async (room, username) => {
        const id = await RoomLifeCycleController.create(room);
        await get().actions.joinRoom(id, username);
      },
      joinRoom: async (id, username) => {
        const { usernames, version, ...rest } =
          await RoomLifeCycleController.join(id, username);
        set((state) => {
          state.room = {
            ...rest,
            id,
            status: RoomStatus.IN_ROOM,
            peers: {},
          };
        });
      },
      leaveRoom: () => {
        set((state) => {
          state.room = {
            status: RoomStatus.HOME,
          };
        });
      },
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
      updatePeer: (id, peer) =>
        set((state) => {
          if (state.room.status !== RoomStatus.IN_ROOM) {
            return;
          }
          state.room.peers[id] = {
            ...(state.room.peers[id] ?? {
              latency: 0,
              finished: false,
              active: false,
              blur: true,
            }),
            ...peer,
          };
        }),
      removePeers: (ids) => {
        set((state) => {
          if (state.room.status !== RoomStatus.IN_ROOM) {
            return;
          }
          const peers = state.room.peers;
          ids.forEach((id) => delete peers[id]);
        });
      },
    },
  }))
);
