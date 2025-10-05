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
import {
  BoundStore,
  CodeWithChanges,
  Id,
  PeerState,
  Question,
  QuestionProgressStatus,
  SelfState,
  Slug,
  TestCases,
  User,
} from "@cb/types";
import { Identifiable } from "@cb/types/utils";
import { getNormalizedUrl } from "@cb/utils";
import { getSelectedPeer } from "@cb/utils/peers";
import _ from "lodash";
import { toast } from "sonner";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";

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

interface UpdatePeerQuestionProgress {
  code?: CodeWithChanges;
  tests?: TestCases;
  status?: QuestionProgressStatus;
}

interface UpdatePeerArgs extends Partial<Pick<PeerState, "url">> {
  questions: Record<Slug, UpdatePeerQuestionProgress>;
}

interface UpdateSelfArgs extends Omit<SelfState, "questions"> {
  questions: {
    [K in keyof SelfState["questions"]]: Partial<SelfState["questions"][K]>;
  };
}

interface RoomState {
  status: RoomStatus;
  room?: Identifiable<{
    name: string;
    isPublic: boolean;
    questions: Question[];
    activeSidebarTab?: SidebarTabIdentifier;
    usernames: User[];
  }>;
  peers: Record<Id, PeerState>;
  self?: SelfState;
}

interface RoomAction {
  room: {
    create: (
      args: Omit<
        NonNullable<RoomState["room"]>,
        "id" | "questions" | "usernames"
      >
    ) => Promise<void>;
    join: (id: Id) => Promise<void>;
    leave: () => Promise<void>;
    loading: () => void;
    addQuestion: (url: string) => Promise<void>;
    updateRoomStoreQuestion: (question: Question) => void;
    setRoom: (
      room: Pick<NonNullable<RoomState["room"]>, "questions" | "usernames">
    ) => void;
    selectQuestion: (url: string) => void;
    selectSidebarTab: (identifier: SidebarTabIdentifier) => void;
    closeSidebarTab: () => void;
  };
  peers: {
    update: (id: Id, peer: Partial<UpdatePeerArgs>) => Promise<void>;
    updateSelf: (state: Partial<UpdateSelfArgs>) => void;
    remove: (ids: Id[]) => void;
    selectPeer: (id: string) => void;
    selectTest: (idx: number) => void;
  };
}

const createRoomStore = (background: BackgroundProxy) => {
  const setRoom = (room: NonNullable<RoomState["room"]>) =>
    useRoom.setState((state) => {
      state.status = RoomStatus.IN_ROOM;
      state.room = room;
      state.self = {
        url: getNormalizedUrl(window.location.href),
        questions: {},
      };
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
      windowMessager.navigate({ url: getNormalizedUrl(url) });
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
        self: {
          url: getNormalizedUrl(window.location.href),
          questions: {},
        },
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
                const { id, name, isPublic, usernames } = room.getRoom();
                setRoom({
                  id,
                  name,
                  isPublic,
                  questions: [metadata.data],
                  usernames,
                });
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
                  const { name, isPublic, questions, usernames } =
                    response.data.getRoom();
                  setRoom({ id, name, isPublic, questions, usernames });
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
                  state.self = { url: state.self?.url, questions: {} };
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
            setRoom: (room) =>
              set((state) => {
                if (state.room != undefined) {
                  state.room.questions = room.questions;
                  state.room.usernames = room.usernames;
                }
              }),
            selectQuestion: (url) => {
              windowMessager.navigate({ url: getNormalizedUrl(url) });
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
              set((state) => {
                const { questions, ...rest } = peer;
                const peerOrDefault: PeerState = state.peers[id] ?? {
                  questions: {},
                  selected: getSelectedPeer(state.peers) == undefined,
                };
                const updatedQuestionProgress = Object.entries(
                  questions ?? {}
                ).reduce(
                  (acc, curr) => {
                    const [url, data] = curr;
                    const normalizedUrl = getNormalizedUrl(url);
                    const { code, tests: testsPayload, status } = data;
                    const questionProgressOrDefault = peerOrDefault.questions[
                      normalizedUrl
                    ] ?? {
                      code: undefined,
                      tests: [],
                      status: QuestionProgressStatus.NOT_STARTED,
                    };

                    if (code != undefined) {
                      questionProgressOrDefault.code = code;
                    }

                    if (testsPayload != undefined) {
                      const tests = testsPayload.map((test) => ({
                        ...test,
                        selected: false,
                      }));
                      const previousSelectedTest =
                        questionProgressOrDefault.tests.findIndex(
                          (test) => test.selected
                        );
                      const selectedTestIndex =
                        previousSelectedTest >= tests.length
                          ? tests.length - 1
                          : Math.max(previousSelectedTest, 0);
                      tests[selectedTestIndex].selected = true;
                      questionProgressOrDefault.tests = tests;
                    }

                    if (status != undefined) {
                      questionProgressOrDefault.status = status;
                    }

                    return {
                      ...acc,
                      [normalizedUrl]: questionProgressOrDefault,
                    };
                  },
                  {} as PeerState["questions"]
                );
                state.peers[id] = {
                  ...peerOrDefault,
                  ...rest,
                  questions: {
                    ...peerOrDefault.questions,
                    ...updatedQuestionProgress,
                  },
                };
              });
            },
            updateSelf: (data) => {
              set((state) => {
                const selfOrDefault: SelfState = {
                  url: getNormalizedUrl(window.location.href),
                  questions: {},
                  ...(state.self ?? {}),
                };

                if (data.url) {
                  selfOrDefault.url = data.url;
                }

                const updatedQuestionProgress = Object.entries(
                  data.questions ?? {}
                ).reduce(
                  (acc, curr) => {
                    const [url, data] = curr;
                    const normalizedUrl = getNormalizedUrl(url);
                    const questionProgressOrDefault = selfOrDefault.questions[
                      normalizedUrl
                    ] ?? {
                      code: undefined,
                      tests: [],
                      status: QuestionProgressStatus.IN_PROGRESS,
                    };

                    if (data.code != undefined) {
                      questionProgressOrDefault.code = data.code;
                    }

                    if (data.tests != undefined) {
                      questionProgressOrDefault.tests = data.tests;
                    }

                    if (data.status != undefined) {
                      questionProgressOrDefault.status = data.status;
                    }

                    return {
                      ...acc,
                      [normalizedUrl]: questionProgressOrDefault,
                    };
                  },
                  {} as SelfState["questions"]
                );

                selfOrDefault.questions = {
                  ...selfOrDefault.questions,
                  ...updatedQuestionProgress,
                };
                state.self = selfOrDefault;
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
                const progress =
                  state.peers[active?.id ?? ""].questions[active?.url ?? ""];
                if (progress != undefined) {
                  progress.tests = progress.tests.map((test, i) => ({
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
      return {
        code: selected?.questions[getNormalizedUrl(window.location.href)]?.code,
        id: selected?.id,
      };
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

export const useRoom = createRoomStore(background);

export type RoomStore = typeof useRoom;
