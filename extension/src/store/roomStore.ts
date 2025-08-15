import { DOM } from "@cb/constants";
import { getOrCreateControllers } from "@cb/services";
import { Id, InternalPeerState, PeerState } from "@cb/types";
import { Identifiable } from "@cb/types/utils";
import { groupTestCases } from "@cb/utils/string";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { MutableState } from "./type";

export enum RoomStatus {
  HOME,
  IN_ROOM,
  LOADING,
  REJOINING,
}

interface RoomState {
  status: RoomStatus;
  room?: Identifiable<{ name: string; isPublic: boolean }>;
  peers: Record<Id, InternalPeerState>;
  /**
   * Internal use only.
   *
   * @see RoomAction#getVariables for API consumption
   */
  _variables: string[];
}

interface RoomAction {
  room: {
    create: (args: Omit<NonNullable<RoomState["room"]>, "id">) => Promise<void>;
    join: (id: Id) => Promise<void>;
    leave: () => Promise<void>;
    loading: () => void;
  };
  peers: {
    update: (id: Id, peer: Partial<PeerState>) => Promise<void>;
    remove: (ids: Id[]) => void;
    selectPeer: (id: string) => void;
    getSelectedPeer: () => Identifiable<InternalPeerState> | undefined;
    selectTest: (idx: number) => void;
  };
  getVariables: () => Promise<string[]>;
}

type _RoomStore = MutableState<RoomState, RoomAction>;

const setRoom = (room: NonNullable<RoomState["room"]>) =>
  useRoom.setState((state) => {
    state.status = RoomStatus.IN_ROOM;
    state.room = room;
  });

export const useRoom = create<_RoomStore>()(
  immer((set, get) => ({
    status: RoomStatus.HOME,
    peers: {},
    _variables: [],

    actions: {
      room: {
        create: async (args) => {
          get().actions.room.loading();
          const room = await getOrCreateControllers().room.create(args);
          const { id, name, isPublic } = room.getRoom();
          setRoom({ id, name, isPublic });
        },
        join: async (id) => {
          get().actions.room.loading();
          const room = await getOrCreateControllers().room.join(id);
          const { name, isPublic } = room.getRoom();
          setRoom({ id, name, isPublic });
        },
        leave: async () => {
          get().actions.room.loading();
          await getOrCreateControllers().room.leave();
          set((state) => {
            state.status = RoomStatus.HOME;
            state.peers = {};
          });
        },
        loading: () =>
          set((state) => {
            state.status = RoomStatus.LOADING;
          }),
      },
      peers: {
        update: async (id, peer) => {
          const variables = await get().actions.getVariables();
          set((state) => {
            const peerOrDefault =
              get().peers[id] ??
              ({
                tests: [],
                latency: 0,
                finished: false,
                active: false,
                blur: true,
                selected: false,
              } as InternalPeerState);
            const { tests: payload, ...rest } = peer;
            const tests =
              payload != undefined
                ? groupTestCases(variables, payload.tests)
                : state.peers[id].tests;
            state.peers[id] = {
              ...peerOrDefault,
              ...rest,
              tests,
            };
          });
        },
        remove: (ids) =>
          set((state) => ids.forEach((id) => delete state.peers[id])),
        selectPeer: (id) => {
          set((state) => {
            const active = get().actions.peers.getSelectedPeer();
            if (active != undefined && active.id !== id) {
              state.peers[active.id].active = false;
            }
            state.peers[id].active = true;
          });
        },
        selectTest: (idx) =>
          set((state) => {
            const active = get().actions.peers.getSelectedPeer();
            if (active != undefined) {
              state.peers[active.id].tests = state.peers[active.id].tests.map(
                (test, i) => ({
                  ...test,
                  selected: i === idx,
                })
              );
            }
          }),
        getSelectedPeer: () => {
          const active = Object.keys(get().peers).find(
            (id) => get().peers[id]?.active
          );
          return active == undefined
            ? undefined
            : { id: active, ...get().peers[active] };
        },
      },
      getVariables: async () => {
        if (get()._variables.length > 0) {
          return get()._variables;
        }
        const variables = await waitForElement(DOM.PROBLEM_ID)
          .then((node) => node as HTMLElement)
          .then((node) => {
            const input = node.innerText.match(/.*Input:(.*)\n/);
            if (input != null) {
              return Array.from(input[1].matchAll(/(\w+)\s=/g)).map(
                (matched) => matched[1]
              );
            }
            throw new Error("Unable to determine test variables");
          })
          .catch((e) => {
            console.error(e);
            return [];
          });
        set((state) => {
          state._variables = variables;
        });
        return variables;
      },
    },
  }))
);

export type RoomStore = typeof useRoom;
