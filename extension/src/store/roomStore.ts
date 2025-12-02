import { DOM } from "@cb/constants";
import { getOrCreateControllers } from "@cb/services";
import background, { BackgroundProxy } from "@cb/services/background";
import { RoomJoinCode } from "@cb/services/controllers/RoomController";
import db from "@cb/services/db";
import {
  getProblemMetaBySlugServer,
  GetProblemMetadataBySlugServerCode,
} from "@cb/services/graphql/metadata";
import { messagePaginationService } from "@cb/services/messages";
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
import { ChatMessage, DatabaseService } from "@cb/types/db";
import { Identifiable, Unsubscribe } from "@cb/types/utils";
import { getNormalizedUrl, getQuestionIdFromUrl } from "@cb/utils";
import { getTestsPayload } from "@cb/utils/messages";
import { getSelectedPeer } from "@cb/utils/peers";
import { groupTestCases } from "@cb/utils/string";
import { QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import _ from "lodash";
import { toast } from "sonner";
import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { shallow } from "zustand/shallow";
import { AppStore, useApp } from "./appStore";

export enum SidebarTabIdentifier {
  ROOM_INFO,
  ROOM_QUESTIONS,
  LEETCODE_QUESTIONS,
  ROOM_CHAT,
}

export enum RoomStatus {
  HOME,
  IN_ROOM,
  BROWSING_ROOM,
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
  messages?: {
    paginated: Array<Identifiable<ChatMessage>>;
    live: Array<Identifiable<ChatMessage>>;
    newestTimestamp: Timestamp | undefined;
    loading: boolean;
    hasNext: boolean;
    lastSnapRef?: QueryDocumentSnapshot<ChatMessage>;
    unsubscribe?: Unsubscribe;
  };
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
    browse: () => void;
    home: () => void;
    addQuestion: (url: string) => Promise<void>;
    updateRoomStoreQuestion: (question: Question) => void;
    setRoom: (
      room: Pick<NonNullable<RoomState["room"]>, "questions" | "usernames">
    ) => void;
    selectQuestion: (url: string) => void;
    selectSidebarTab: (identifier: SidebarTabIdentifier) => void;
    closeSidebarTab: () => void;
    getVariables: (url: string) => Question["variables"] | undefined;
  };
  peers: {
    update: (id: Id, peer: Partial<UpdatePeerArgs>) => Promise<void>;
    remove: (ids: Id[]) => void;
    selectPeer: (id: string) => void;
    selectTest: (idx: number) => void;
    toggleCodeVisibility: () => void;
  };
  self: {
    update: (state: Partial<UpdateSelfArgs>) => void;
    complete: (url: string) => void;
  };
  messages: {
    loadMore: (roomId: Id) => Promise<void>;
    handleNewMessage: (msg: Identifiable<ChatMessage>) => void;
    sendMessage: (
      message: Parameters<DatabaseService["room"]["addMessage"]>[1]
    ) => Promise<void>;
  };
}

const createRoomStore = (background: BackgroundProxy, appStore: AppStore) => {
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
    useRoom.getState().actions.room.loading();
    try {
      const metadata = await getProblemMetaBySlugServer(
        getQuestionIdFromUrl(url)
      );
      if (metadata.code !== GetProblemMetadataBySlugServerCode.SUCCESS) {
        console.error("Failed to fetch graphql metadata", metadata);
        toast.error("Failed to select next problem. Please try again");
        return;
      }
      const instance = getOrCreateControllers().room.instance();
      if (instance == undefined) {
        throw new Error(
          "Attempt to add question when not in room. This is most likely a bug"
        );
      }
      await instance.addQuestion(metadata.data);
      getOrCreateControllers().message.dispatchAddQuestion(metadata.data.title);
      useRoom.getState().actions.room.updateRoomStoreQuestion(metadata.data);
      windowMessager.navigate({ url: getNormalizedUrl(url) });
    } catch (error) {
      console.error("Error when adding question", error);
      toast.error("Failed to add question. Please try again");
    } finally {
      useRoom.setState((state) => {
        state.status = RoomStatus.IN_ROOM;
      });
    }
  }, 500);

  const derivePeerState = (state: PeerState, args: Partial<UpdatePeerArgs>) => {
    const { questions, ...rest } = args;
    const updatedQuestionProgress = Object.entries(questions ?? {}).reduce(
      (acc, curr) => {
        const [url, data] = curr;
        const normalizedUrl = getNormalizedUrl(url);
        const { code, tests: testsPayload, status } = data;
        const questionProgressOrDefault = state.questions[normalizedUrl] ?? {
          code: undefined,
          tests: [],
          status: QuestionProgressStatus.NOT_STARTED,
          viewable: false,
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
            questionProgressOrDefault.tests.findIndex((test) => test.selected);
          const selectedTestIndex =
            previousSelectedTest >= tests.length
              ? tests.length - 1
              : Math.max(previousSelectedTest, 0);
          if (tests[selectedTestIndex] != undefined) {
            tests[selectedTestIndex].selected = true;
          }
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
    return {
      ...state,
      ...rest,
      questions: {
        ...state.questions,
        ...updatedQuestionProgress,
      },
    };
  };

  const setSelfProgressForCurrentUrl = async (question: Question) => {
    const code = await background.getCode({});
    const { tests } = getTestsPayload(question.variables);
    useRoom.getState().actions.self.update({
      questions: {
        [question.url]: {
          code,
          tests,
        },
      },
    });
  };

  const initializeChatMessages = async (roomId: Id) => {
    try {
      useRoom.setState((state) => {
        state.messages = {
          paginated: [],
          live: [],
          newestTimestamp: undefined,
          loading: true,
          hasNext: false,
          lastSnapRef: undefined,
          unsubscribe: undefined,
        };
      });

      const page = await messagePaginationService.fetchMessages(roomId);

      let newestTimestamp: Timestamp | undefined;
      if (page.messages.length > 0) {
        newestTimestamp = page.messages[page.messages.length - 1].createdAt;
      } else {
        const room = await db.room.get(roomId);
        newestTimestamp = room?.createdAt;
      }

      const unsubscribe = db.room.observer.messages(
        roomId,
        {
          onAdded: handleMessageAdded,
          onModified: () => {},
          onDeleted: () => {},
        },
        newestTimestamp
      );

      useRoom.setState((state) => {
        if (state.messages) {
          state.messages.paginated = page.messages;
          state.messages.newestTimestamp = newestTimestamp;
          state.messages.lastSnapRef = page.lastDoc;
          state.messages.loading = false;
          state.messages.hasNext = page.hasMore;
          state.messages.unsubscribe = unsubscribe;
        }
      });
    } catch (error) {
      console.error("Failed to initialize messages", error);
      useRoom.setState((state) => {
        if (state.messages) {
          state.messages.loading = false;
        }
      });
    }
  };

  const cleanupChatMessages = () => {
    const messagesState = useRoom.getState().messages;
    if (messagesState?.unsubscribe) {
      messagesState.unsubscribe();
    }
    useRoom.setState((state) => {
      state.messages = undefined;
    });
  };

  const handleMessageAdded = (msg: Identifiable<ChatMessage>) => {
    useRoom.getState().actions.messages.handleNewMessage(msg);
  };

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
                const { id, name, isPublic, users } = room.getRoom();
                setRoom({
                  id,
                  name,
                  isPublic,
                  questions: [metadata.data],
                  usernames: Object.keys(users),
                });
                setSelfProgressForCurrentUrl(metadata.data);
                await initializeChatMessages(id);
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
                  const { name, isPublic, questions, users } =
                    response.data.getRoom();
                  setRoom({
                    id,
                    name,
                    isPublic,
                    questions,
                    usernames: Object.keys(users),
                  });

                  const question = questions.find(
                    (question) =>
                      question.url === getNormalizedUrl(window.location.href)
                  );
                  if (question != undefined) {
                    setSelfProgressForCurrentUrl(question);
                  }

                  // todo(nickbar01234): There's a race between populating self-data and WebRTC connection succeeding
                  // Perhaps some sort of backfilling mechanism
                  const progress = await response.data.getUserProgress();
                  if (progress != undefined) {
                    get().actions.self.update(progress);
                  }

                  await initializeChatMessages(id);
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
                cleanupChatMessages();
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
            browse: () =>
              set((state) => {
                state.status = RoomStatus.BROWSING_ROOM;
              }),
            home: () =>
              set((state) => {
                state.status = RoomStatus.HOME;
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
                  room.usernames
                    .filter(
                      (username) =>
                        username !==
                        appStore.getState().actions.getAuthUser().username
                    )
                    .forEach((username) => {
                      const peerOrDefault: PeerState = state.peers[
                        username
                      ] ?? {
                        questions: {},
                        url: undefined,
                        selected: getSelectedPeer(state.peers) === undefined,
                      };
                      const peerWithOverrides = room.questions.reduce(
                        (acc, curr) => {
                          if (!Object.keys(acc.questions).includes(curr.url)) {
                            return derivePeerState(acc, {
                              questions: {
                                [curr.url]: {
                                  code: {
                                    value: curr.codeSnippets[0]?.code,
                                    language: curr.codeSnippets[0]?.langSlug,
                                    changes: "{}",
                                  },
                                  tests: groupTestCases(
                                    curr.variables,
                                    curr.testSnippets
                                  ),
                                },
                              },
                            });
                          }
                          return acc;
                        },
                        peerOrDefault
                      );
                      state.peers[username] = peerWithOverrides;
                    });
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
            getVariables: (url) => {
              const questions = get().room?.questions ?? [];
              const questionWithUrl = questions.find(
                (question) => question.url === url
              );
              return questionWithUrl?.variables;
            },
          },
          peers: {
            update: async (id, peer) => {
              set((state) => {
                const peerOrDefault: PeerState = state.peers[id] ?? {
                  questions: {},
                  selected: getSelectedPeer(state.peers) == undefined,
                  url: undefined,
                };
                state.peers[id] = derivePeerState(peerOrDefault, peer);
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
                  state.peers[active?.id ?? ""].questions[
                    getNormalizedUrl(window.location.href)
                  ];
                if (progress != undefined) {
                  progress.tests = progress.tests.map((test, i) => ({
                    ...test,
                    selected: i === idx,
                  }));
                }
              }),
            toggleCodeVisibility: () =>
              set((state) => {
                const active = getSelectedPeer(state.peers);
                const url = getNormalizedUrl(window.location.href);
                const questions = state.peers[active?.id ?? ""].questions ?? {};
                if (questions[url] != undefined) {
                  questions[url].viewable = !questions[url].viewable;
                }
              }),
          },
          self: {
            update: (data) => {
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
            complete: async (url) => {
              const instance = getOrCreateControllers().room.instance();
              if (instance != undefined) {
                const normalizedUrl = getNormalizedUrl(url);
                get().actions.self.update({
                  questions: {
                    [normalizedUrl]: {
                      status: QuestionProgressStatus.COMPLETED,
                    },
                  },
                });
                const progress = get().self?.questions[normalizedUrl];
                const code = progress?.code;
                await instance.completeQuestion(normalizedUrl, {
                  code: {
                    value: code?.value ?? "",
                    language: code?.language ?? "",
                  },
                  tests: progress?.tests ?? [],
                  status: QuestionProgressStatus.COMPLETED,
                });
              }
            },
          },
          messages: {
            loadMore: async (roomId: Id) => {
              const currentState = get();
              const messagesState = currentState.messages;

              if (
                !messagesState ||
                messagesState.loading ||
                !messagesState.hasNext ||
                !messagesState.lastSnapRef
              ) {
                return;
              }

              try {
                set((state) => {
                  if (state.messages) {
                    state.messages.loading = true;
                  }
                });

                const page = await messagePaginationService.fetchMessages(
                  roomId,
                  messagesState.lastSnapRef
                );

                set((state) => {
                  if (state.messages) {
                    state.messages.paginated = [
                      ...page.messages,
                      ...state.messages.paginated,
                    ];
                    state.messages.lastSnapRef =
                      page.lastDoc || messagesState.lastSnapRef;
                    state.messages.loading = false;
                    state.messages.hasNext = page.hasMore;
                  }
                });
              } catch (error) {
                console.error("Failed to load more messages", error);
                set((state) => {
                  if (state.messages) {
                    state.messages.loading = false;
                  }
                });
              }
            },
            handleNewMessage: (msg: Identifiable<ChatMessage>) => {
              set((state) => {
                if (state.messages) {
                  const lastPaginated =
                    state.messages.paginated[
                      state.messages.paginated.length - 1
                    ];
                  const isDuplicate =
                    lastPaginated?.id === msg.id ||
                    state.messages.live.some((m) => m.id === msg.id);
                  if (!isDuplicate) {
                    state.messages.live.push(msg);
                  }
                }
              });
            },
            sendMessage: async (message) => {
              const roomId = get().room?.id;
              if (!roomId) {
                throw new Error("Cannot send message: not in a room");
              }
              try {
                await db.room.addMessage(roomId, message);
              } catch (error) {
                console.error("Failed to send message", error);
                throw error;
              }
            },
          },
        },
      }))
    )
  );

  useRoom.subscribe(
    (state) => {
      const url = getNormalizedUrl(window.location.href);
      const selected = getSelectedPeer(state.peers);
      return {
        peerCode: selected?.questions[url]?.code,
        id: selected?.id,
      };
    },
    (current, prev) => {
      if (current.id == undefined) {
        return;
      } else if (current.peerCode != undefined) {
        background.applyCodeToEditor({
          code: current.peerCode.value ?? "",
          language: current.peerCode.language ?? "",
          changes: JSON.parse(current.peerCode?.changes ?? "{}"),
          changeUser: current.id !== prev?.id,
          editorId: DOM.CODEBUDDY_EDITOR_ID,
        });
      }
    },
    { equalityFn: shallow }
  );

  return useRoom;
};

export const useRoom = createRoomStore(background, useApp);

export type RoomStore = typeof useRoom;
