import { getOrCreateControllers } from "@cb/services";
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
  isPublic: boolean;
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
  createRoom: (room: { isPublic: boolean; name: string }) => Promise<void>;
  joinRoom: (id: string) => Promise<void>;
  leaveRoom: () => void;
  loadingRoom: () => void;
  rejoiningRoom: () => void;
  homeRoom: () => void;
  updatePeer: (id: string, peer: Partial<PeerState>) => void;
  removePeers: (ids: string[]) => void;
}

type _RoomStore = MutableState<RoomState, RoomAction>;

export const roomStore = createStore<_RoomStore>()(
  immer((set, get) => ({
    room: {
      // todo(nickbar01234): Make this loading on startup?
      status: RoomStatus.HOME,
    },
    actions: {
      createRoom: async (room) => {
        const { room: controller } = getOrCreateControllers();
        const { id, isPublic, name } = (
          await controller.create(room)
        ).getRoom();
        set((state) => {
          state.room = {
            id,
            isPublic,
            name,
            peers: {},
            status: RoomStatus.IN_ROOM,
          };
        });
      },
      joinRoom: async (id) => {
        const { room: controller } = getOrCreateControllers();
        const { isPublic, name } = (await controller.join(id)).getRoom();
        set((state) => {
          state.room = {
            id,
            isPublic,
            name,
            peers: {},
            status: RoomStatus.IN_ROOM,
          };
        });
      },
      leaveRoom: () => {
        set((state) => {
          state.room = {
            status: RoomStatus.HOME,
          };
        });
        getOrCreateControllers().room.leave();
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

export type RoomStore = typeof roomStore;
