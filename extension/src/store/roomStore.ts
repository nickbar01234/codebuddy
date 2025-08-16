import { DOM } from "@cb/constants";
import { getOrCreateControllers, sendServiceRequest } from "@cb/services";
import { Id, InternalPeerState, PeerState } from "@cb/types";
import { Identifiable } from "@cb/types/utils";
import { getSelectedPeer } from "@cb/utils/peers";
import { groupTestCases } from "@cb/utils/string";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";
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
    selectTest: (idx: number) => void;
  };
  getVariables: () => Promise<string[]>;
}

type _RoomStore = MutableState<RoomState, RoomAction>;

const createRoomStore = () => {
  const setRoom = (room: NonNullable<RoomState["room"]>) =>
    useRoom.setState((state) => {
      state.status = RoomStatus.IN_ROOM;
      state.room = room;
    });

  const useRoom = create<_RoomStore>()(
    subscribeWithSelector(
      immer((set, get) => ({
        status: RoomStatus.HOME,
        peers: {},
        _variables: [],

        actions: {
          room: {
            create: async (args) => {
              // todo(nickbar01234): Error handling
              get().actions.room.loading();
              const room = await getOrCreateControllers().room.create(args);
              const { id, name, isPublic } = room.getRoom();
              setRoom({ id, name, isPublic });
            },
            join: async (id) => {
              // todo(nickbar01234): Error handling
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
                  state.peers[id] ??
                  ({
                    tests: [],
                    latency: 0,
                    finished: false,
                    viewable: true,
                    selected: getSelectedPeer(state.peers) == undefined,
                  } as InternalPeerState);
                const { tests: payload, ...rest } = peer;
                const tests =
                  payload != undefined
                    ? groupTestCases(variables, payload.tests)
                    : peerOrDefault.tests;
                if (tests.length > 0) {
                  const previousSelectedTest = peerOrDefault.tests.findIndex(
                    (test) => test.selected
                  );
                  const selectedTestIndex =
                    previousSelectedTest >= tests.length
                      ? tests.length - 1
                      : Math.max(previousSelectedTest, 0);
                  tests[selectedTestIndex].selected = true;
                }
                state.peers[id] = {
                  ...peerOrDefault,
                  ...rest,
                  tests,
                };
              });
            },
            remove: (ids) => {
              // todo(nickbar01234): If currently selected peer is remove, we should pick a new one
              set((state) => ids.forEach((id) => delete state.peers[id]));
            },
            selectPeer: (id) => {
              set((state) => {
                const active = getSelectedPeer(state.peers);
                if (active != undefined && active.id !== id) {
                  state.peers[active.id].selected = false;
                }

                if (state.peers[id] != undefined) {
                  state.peers[id].selected = true;
                }
              });
            },
            selectTest: (idx) =>
              set((state) => {
                const active = getSelectedPeer(state.peers);
                if (active != undefined) {
                  state.peers[active.id].tests = state.peers[
                    active.id
                  ].tests.map((test, i) => ({
                    ...test,
                    selected: i === idx,
                  }));
                }
              }),
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
    )
  );

  useRoom.subscribe(
    (state) => getSelectedPeer(state.peers),
    (current, prev) => {
      if (current == undefined) {
        return;
      } else {
        sendServiceRequest({
          action: "setValueOtherEditor",
          code: current.code?.code.value ?? "",
          language: current.code?.code.language ?? "",
          changes: JSON.parse(current.code?.changes ?? "{}"),
          changeUser: current.id !== prev?.id,
          editorId: DOM.CODEBUDDY_EDITOR_ID,
        });
      }
    },
    // todo(nickbar01234): We can be more efficient with equality function
    { equalityFn: shallow }
  );

  return useRoom;
};

export const useRoom = createRoomStore();

export type RoomStore = typeof useRoom;
