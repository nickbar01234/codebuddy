import { DOM } from "@cb/constants";
import { getOrCreateControllers } from "@cb/services";
import background, { BackgroundProxy } from "@cb/services/background";
import { BoundStore, Id, PeerMessage, PeerState } from "@cb/types";
import { ExtractMessage, Identifiable, MessagePayload } from "@cb/types/utils";
import { getSelectedPeer } from "@cb/utils/peers";
import { groupTestCases } from "@cb/utils/string";
import { toast } from "sonner";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";
import { LeetCodeStore, useLeetCode } from "./leetCodeStore";

export enum RoomStatus {
  HOME,
  IN_ROOM,
  LOADING,
  REJOINING,
}

interface UpdatePeerArgs extends Omit<PeerState, "tests"> {
  tests: MessagePayload<ExtractMessage<PeerMessage, "tests">>;
}

interface RoomState {
  status: RoomStatus;
  room?: Identifiable<{ name: string; isPublic: boolean }>;
  peers: Record<Id, PeerState>;
}

interface RoomAction {
  room: {
    create: (args: Omit<NonNullable<RoomState["room"]>, "id">) => Promise<void>;
    join: (id: Id) => Promise<void>;
    leave: () => Promise<void>;
    loading: () => void;
  };
  peers: {
    update: (id: Id, peer: Partial<UpdatePeerArgs>) => Promise<void>;
    remove: (ids: Id[]) => void;
    selectPeer: (id: string) => void;
    selectTest: (idx: number) => void;
  };
}

const createRoomStore = (
  leetcodeStore: LeetCodeStore,
  background: BackgroundProxy
) => {
  const setRoom = (room: NonNullable<RoomState["room"]>) =>
    useRoom.setState((state) => {
      state.status = RoomStatus.IN_ROOM;
      state.room = room;
    });

  const useRoom = create<BoundStore<RoomState, RoomAction>>()(
    subscribeWithSelector(
      immer((set, get) => ({
        status: RoomStatus.HOME,
        peers: {},
        actions: {
          room: {
            create: async (args) => {
              try {
                get().actions.room.loading();
                const room = await getOrCreateControllers().room.create(args);
                const { id, name, isPublic } = room.getRoom();
                setRoom({ id, name, isPublic });
              } catch (error) {
                toast.error("Failed to create room. Please try again.");
                console.error("Failed to create room", error);
                set((state) => {
                  state.status = RoomStatus.HOME;
                });
              }
            },
            join: async (id) => {
              try {
                get().actions.room.loading();
                const room = await getOrCreateControllers().room.join(id);
                const { name, isPublic } = room.getRoom();
                setRoom({ id, name, isPublic });
              } catch (error) {
                toast.error("Room ID is invalid. Please try again.");
                console.error("Failed to join room", error);
                set((state) => {
                  state.status = RoomStatus.HOME;
                });
              }
            },
            leave: async () => {
              try {
                get().actions.room.loading();
                await getOrCreateControllers().room.leave();
              } finally {
                set((state) => {
                  state.status = RoomStatus.HOME;
                  state.peers = {};
                });
              }
            },
            loading: () =>
              set((state) => {
                state.status = RoomStatus.LOADING;
              }),
          },
          peers: {
            update: async (id, peer) => {
              const variables = await leetcodeStore
                .getState()
                .actions.getVariables();
              set((state) => {
                const peerOrDefault =
                  state.peers[id] ??
                  ({
                    tests: [],
                    latency: 0,
                    finished: false,
                    viewable: true,
                    selected: getSelectedPeer(state.peers) == undefined,
                  } as PeerState);
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
              set((state) => {
                const selectedPeerBeingRemoved = ids.includes(
                  getSelectedPeer(state.peers)?.id ?? ""
                );
                ids.forEach((id) => delete state.peers[id]);
                if (selectedPeerBeingRemoved) {
                  const remainingPeerIds = Object.keys(state.peers);
                  if (remainingPeerIds.length > 0) {
                    // Select the first available peer
                    const newSelectedPeerId = remainingPeerIds[0];
                    state.peers[newSelectedPeerId].selected = true;
                  }
                }
              });
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
        },
      }))
    )
  );

  useRoom.subscribe(
    (state) => {
      const selected = getSelectedPeer(state.peers);
      return { code: selected?.code, id: selected?.id };
    },
    (current, prev) => {
      if (current.id == undefined) {
        return;
      } else {
        background.applyCodeToEditor({
          code: current.code?.value ?? "",
          language: current.code?.language ?? "",
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

export const useRoom = createRoomStore(useLeetCode, background);

export type RoomStore = typeof useRoom;
