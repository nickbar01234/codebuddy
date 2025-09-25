import { DOM } from "@cb/constants";
import { getOrCreateControllers } from "@cb/services";
import background, { BackgroundProxy } from "@cb/services/background";
import {
  AddQuestionCode,
  RoomJoinCode,
} from "@cb/services/controllers/RoomController";
import {
  getProblemMetaBySlugServer,
  GetProblemMetadataBySlugServerCode,
} from "@cb/services/graphql/metadata";
import { windowMessager } from "@cb/services/window";
import { BoundStore, Id, PeerMessage, PeerState, Question } from "@cb/types";
import { ExtractMessage, Identifiable, MessagePayload } from "@cb/types/utils";
import { getSelectedPeer } from "@cb/utils/peers";
import { groupTestCases } from "@cb/utils/string";
import _ from "lodash";
import { toast } from "sonner";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";
import { LeetCodeStore, useLeetCode } from "./leetCodeStore";

export enum SidebarTabIdentifier {
  ROOM_INFO,
  ROOM_QUESTIONS,
  LEETCODE_QUESTIONS,
}

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
  room?: Identifiable<{
    name: string;
    isPublic: boolean;
    questions: Question[];
    activeSidebarTab?: SidebarTabIdentifier;
  }>;
  peers: Record<Id, PeerState>;
}

interface RoomAction {
  room: {
    create: (
      args: Omit<NonNullable<RoomState["room"]>, "id" | "questions">
    ) => Promise<void>;
    join: (id: Id) => Promise<void>;
    leave: () => Promise<void>;
    loading: () => void;
    addQuestion: (url: string) => Promise<void>;
    updateRoomStoreQuestion: (question: Question) => void;
    setRoomStoreQuestions: (questions: Question[]) => void;
    selectQuestion: (url: string) => void;
    selectSidebarTab: (identifier: SidebarTabIdentifier) => void;
    closeSidebarTab: () => void;
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

  const debouncedAddQuestion = _.debounce(async (url: string) => {
    const metadata = await getProblemMetaBySlugServer(
      getQuestionIdFromUrl(url)
    );
    if (metadata.code !== GetProblemMetadataBySlugServerCode.SUCCESS) {
      console.error("Failed to fetch graphql metadata", metadata);
      toast.error("Failed to select next problem. Please try again");
      return;
    }
    try {
      const addQuestionResponse =
        await getOrCreateControllers().room.addQuestion(metadata.data);
      if (addQuestionResponse == AddQuestionCode.NOT_IN_ROOM) {
        throw new Error(
          "Attempt to add question when not in room. This is most likely a bug"
        );
      }
      useRoom.getState().actions.room.updateRoomStoreQuestion(metadata.data);
      windowMessager.navigate({ url });
    } catch (error) {
      console.error("Error when adding question", error);
      toast.error("Failed to add question. Please try again");
    }
  }, 500);

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
                const metadata = await getProblemMetaBySlugServer(
                  getQuestionIdFromUrl(window.location.href)
                );
                if (
                  metadata.code !== GetProblemMetadataBySlugServerCode.SUCCESS
                ) {
                  throw new Error(`Graphql metadata errors ${metadata}`);
                }
                const room = await getOrCreateControllers().room.create({
                  ...args,
                  questions: [metadata.data],
                });
                const { id, name, isPublic } = room.getRoom();
                setRoom({ id, name, isPublic, questions: [metadata.data] });
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
                const response = await getOrCreateControllers().room.join(id);
                if (response.code === RoomJoinCode.SUCCESS) {
                  const { name, isPublic, questions } = response.data.getRoom();
                  setRoom({ id, name, isPublic, questions });
                } else {
                  if (response.code === RoomJoinCode.NOT_EXISTS) {
                    toast.error("Room ID is invalid. Please try again.");
                    console.error(`Room with ID ${id} does not exist.`);
                  } else if (response.code === RoomJoinCode.MAX_CAPACITY) {
                    toast.error("Room is full. Please try another one.");
                    console.error(`Room with ID ${id} is full.`);
                  }
                  set((state) => {
                    state.status = RoomStatus.HOME;
                  });
                }
              } catch (error) {
                toast.error("Failed to join room. Please try again.");
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
                  state.room = undefined;
                });
              }
            },
            loading: () =>
              set((state) => {
                state.status = RoomStatus.LOADING;
              }),
            addQuestion: async (url) => debouncedAddQuestion(url),
            updateRoomStoreQuestion(question) {
              // todo(nickbar01234): We need a timestamp on question so the ordering is stable.
              set((state) => {
                if (
                  state.room != undefined &&
                  !state.room.questions.includes(question)
                ) {
                  state.room.questions.push(question);
                }
              });
            },
            setRoomStoreQuestions: (questions) =>
              set((state) => {
                if (state.room != undefined) {
                  state.room.questions = questions;
                }
              }),
            selectQuestion: (url) => {
              windowMessager.navigate({ url });
              get().actions.room.closeSidebarTab();
            },
            selectSidebarTab: (identifier) =>
              set((state) => {
                if (state.room != undefined) {
                  state.room.activeSidebarTab = identifier;
                }
              }),
            closeSidebarTab: () => {
              set((state) => {
                if (state.room != undefined) {
                  state.room.activeSidebarTab = undefined;
                }
              });
            },
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
    { equalityFn: shallow }
  );

  return useRoom;
};

export const useRoom = createRoomStore(useLeetCode, background);

export type RoomStore = typeof useRoom;
