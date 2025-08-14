import { DOM } from "@cb/constants";
import { getOrCreateControllers, sendServiceRequest } from "@cb/services";
import { _PeerState, PeerState } from "@cb/types";
import { Identifable } from "@cb/types/utils";
import { groupTestCases } from "@cb/utils/string";
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
  peers: Record<string, _PeerState>;
}

interface LoadingState {
  status: RoomStatus.LOADING;
}

interface RejoiningState {
  status: RoomStatus.REJOINING;
}

export interface RoomState {
  room: HomeState | InRoomState | LoadingState | RejoiningState;
  // Problem variables
  variables: string[];
}

interface RoomAction {
  getRoom: () => Omit<InRoomState, "status"> | undefined;
  createRoom: (room: { isPublic: boolean; name: string }) => Promise<void>;
  joinRoom: (id: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  loadingRoom: () => void;
  rejoiningRoom: () => void;
  homeRoom: () => void;
  selectPeer: (id: string) => void;
  getActivePeer: () => Identifable<_PeerState> | undefined;
  updatePeer: (id: string, peer: Partial<PeerState>) => void;
  selectTest: (idx: number) => void;
  removePeers: (ids: string[]) => void;
  inferVariables: () => Promise<string[]>;
}

type _RoomStore = MutableState<RoomState, RoomAction>;

export const roomStore = createStore<_RoomStore>()(
  immer((set, get) => ({
    room: {
      // todo(nickbar01234): Make this loading on startup?
      status: RoomStatus.HOME,
    },
    variables: [],
    actions: {
      getRoom: () => {
        const room = get().room;
        if (room.status != RoomStatus.IN_ROOM) {
          return undefined;
        }
        const { status, ...rest } = room;
        return rest;
      },
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
      leaveRoom: async () => {
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
      selectPeer: (id) => {
        set((state) => {
          if (state.room.status !== RoomStatus.IN_ROOM) {
            return;
          }
          const maybeActive = get().actions.getActivePeer();
          if (maybeActive != undefined && id != maybeActive.id) {
            state.room.peers[maybeActive.id].active = false;
          }

          state.room.peers[id].active = true;
          if (id !== maybeActive?.id) {
            const data = state.room.peers[id];
            // todo(nickbar01234): Move to subscriber
            sendServiceRequest({
              action: "setValueOtherEditor",
              code: data.code?.code.value ?? "",
              language: data.code?.code.language ?? "",
              changes: JSON.parse(data.code?.changes ?? "{}"),
              changeUser: true,
              editorId: DOM.CODEBUDDY_EDITOR_ID,
            });
          }
        });
      },
      selectTest: (idx) => {
        set((state) => {
          if (state.room.status !== RoomStatus.IN_ROOM) {
            return;
          }
          const maybeActive = get().actions.getActivePeer();
          if (maybeActive != undefined) {
            state.room.peers[maybeActive.id].tests = (
              maybeActive.tests ?? []
            ).map((test, currIndex) => ({
              ...test,
              selected: idx === currIndex,
            }));
          }
        });
      },
      getActivePeer: () => {
        const room = get().room;
        if (room.status !== RoomStatus.IN_ROOM) {
          return;
        }
        const active = Object.keys(room.peers).find(
          (peer) => room.peers[peer].active
        );
        return active != undefined
          ? {
              id: active,
              ...room.peers[active],
            }
          : undefined;
      },
      updatePeer: async (id, peer) => {
        const variables = await get().actions.inferVariables();
        set((state) => {
          if (state.room.status === RoomStatus.IN_ROOM) {
            const data = state.room.peers[id] ?? {
              latency: 0,
              finished: false,
              active: false,
              viewable: true,
              tests: [],
            };

            const tests = groupTestCases(variables, peer.tests?.tests);
            const hasActiveTest = tests.some((test) => test.selected);
            if (!hasActiveTest) {
              tests[0].selected = true;
            }
            state.room.peers[id] = {
              ...data,
              ...peer,
              tests,
              active: Object.keys(state.room.peers).length === 1,
            };

            if (state.room.peers[id].active) {
              // todo(nickbar01234): Move to subscriber
              sendServiceRequest({
                action: "setValueOtherEditor",
                code: data.code?.code.value ?? "",
                language: data.code?.code.language ?? "",
                changes: JSON.parse(data.code?.changes ?? "{}"),
                changeUser:
                  Object.keys(state.room.peers).length === 1 && !data.active,
                editorId: DOM.CODEBUDDY_EDITOR_ID,
              });
            }
          }
        });
      },
      removePeers: (ids) => {
        set((state) => {
          if (state.room.status !== RoomStatus.IN_ROOM) {
            return;
          }
          const peers = state.room.peers;
          ids.forEach((id) => delete peers[id]);
        });
      },
      inferVariables: async () => {
        if (get().variables.length > 0) {
          return get().variables;
        }
        const variables = await waitForElement(DOM.PROBLEM_ID, DOM.TIMEOUT)
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
          state.variables = variables;
        });
        return variables;
      },
    },
  }))
);

export type RoomStore = typeof roomStore;
