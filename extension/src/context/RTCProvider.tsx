import {
  LEETCODE_SUBMISSION_RESULT,
  LEETCODE_SUBMIT_BUTTON,
} from "@cb/constants/page-elements";
import {
  firestore,
  getAllSessionId,
  getRoom,
  getRoomRef,
  getRoomUserRef,
  getSession,
  getSessionPeerConnectionRef,
  getSessionPeerConnectionRefs,
  getSessionRef,
  setRoom,
  setSession,
  setSessionPeerConnection,
} from "@cb/db";
import { useAppState, useOnMount } from "@cb/hooks";
import useResource from "@cb/hooks/useResource";
import {
  clearLocalStorage,
  getLocalStorage,
  sendServiceRequest,
  setLocalStorage,
} from "@cb/services";
import {
  EventType,
  ExtractMessage,
  LeetCodeContentChange,
  PeerInformation,
  PeerMessage,
  PeerState,
  ResponseStatus,
  WindowMessage,
} from "@cb/types";
import {
  constructUrlFromQuestionId,
  getQuestionIdFromUrl,
  waitForElement,
} from "@cb/utils";
import { calculateNewRTT, getUnixTs } from "@cb/utils/heartbeat";
import { withPayload } from "@cb/utils/messages";
import { poll, wait } from "@cb/utils/poll";
import {
  arrayRemove,
  arrayUnion,
  getDocs,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
  writeBatch,
} from "firebase/firestore";
import React from "react";
import { toast } from "sonner";
import { Connection } from "types/utils";
import { additionalServers } from "./additionalServers";
import { AppState } from "./AppStateProvider";

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
    ...additionalServers,
  ],
  iceCandidatePoolSize: 10,
};

const CODE_MIRROR_CONTENT = ".cm-content";

export const HEARTBEAT_INTERVAL = 15000; // ms
const CHECK_ALIVE_INTERVAL = 15000; // ms
const TIMEOUT = 100; // seconds;

interface CreateRoom {
  roomId?: string;
  roomName?: string;
  isPublic: boolean;
}

export interface RTCContext {
  createRoom: (args: CreateRoom) => void;
  joinRoom: (roomId: string) => Promise<boolean>;
  leaveRoom: (roomId: string | null) => Promise<void>;
  roomId: string | null;
  setRoomId: (id: string) => void;
  informations: Record<string, PeerInformation>;
  peerState: Record<string, PeerState>;
  joiningBackRoom: () => Promise<void>;
  handleChooseQuestion: (questionId: string) => void;
  handleNavigateToNextQuestion: () => void;
  deletePeers: (peers: string[]) => Promise<void>;
}

interface RTCProviderProps {
  children: React.ReactNode;
}

export const RTCContext = React.createContext({} as RTCContext);

export const MAX_CAPACITY = 4;

export const RTCProvider = (props: RTCProviderProps) => {
  const {
    user: { username },
    setState: setAppState,
  } = useAppState();
  const [roomId, setRoomId] = React.useState<null | string>(null);
  const { state: appState } = useAppState();
  const [informations, setInformations] = React.useState<
    Record<string, PeerInformation>
  >({});
  const [peerState, setPeerState] = React.useState<Record<string, PeerState>>(
    {}
  );
  const sessionId = React.useMemo(
    () => getQuestionIdFromUrl(window.location.href),
    []
  );

  const {
    register: registerConnection,
    get: getConnection,
    evict: evictConnection,
    cleanup: cleanupConnection,
    set: setConnection,
  } = useResource<Connection>({});
  const {
    register: registerSnapshot,
    get: getSnapshot,
    cleanup: cleanupSnapshot,
    evict: evictSnapshot,
  } = useResource<Unsubscribe>({ name: "snapshot" });

  useOnMount(() => {
    waitForElement(LEETCODE_SUBMIT_BUTTON, 2000)
      .then((button) => button as HTMLButtonElement)
      .then((button) => {
        const originalOnClick = button.onclick;
        if (import.meta.env.MODE === "development") {
          const mockBtn = button.cloneNode(true) as HTMLButtonElement;
          button.replaceWith(mockBtn);
          mockBtn.onclick = function (event) {
            event.preventDefault();
            handleSucessfulSubmissionRef.current();
            return;
          };
        } else {
          button.onclick = function (event) {
            if (originalOnClick) {
              originalOnClick.call(this, event);
            }
            waitForElement(LEETCODE_SUBMISSION_RESULT, 10000)
              .then(() => handleSucessfulSubmissionRef.current())
              .catch(() => handleFailedSubmissionRef.current());
          };
        }
      })
      .catch((error) => {
        console.log("Error mounting callback on submit code button:", error);
      });
  });

  const sendMessageToAll = React.useRef((fn: ReturnType<typeof withPayload>) =>
    Object.entries(getConnection()).forEach(([peer, connection]) =>
      fn(peer, connection)
    )
  ).current;

  const sendHeartBeat = React.useRef(() =>
    sendMessageToAll(withPayload({ action: "heartbeat" }))
  ).current;

  const getCodeMessagePayload = React.useRef(
    async (changes: Partial<LeetCodeContentChange>) =>
      withPayload({
        action: "code",
        code: await sendServiceRequest({ action: "getValue" }),
        changes: JSON.stringify(changes),
      })
  ).current;

  const getTestsMessagePayload = React.useRef(() =>
    withPayload({
      action: "tests",
      tests: (
        document.querySelector(CODE_MIRROR_CONTENT) as HTMLDivElement
      ).innerText.split("\n"),
    })
  ).current;

  const receiveCode = React.useCallback(
    (payload: ExtractMessage<PeerMessage, "code">, peer: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { action: _, ...rest } = payload;
      setInformations((prev) => ({
        ...prev,
        [peer]: {
          ...prev[peer],
          code: rest,
        },
      }));
    },
    []
  );

  const receiveTests = React.useCallback(
    (payload: ExtractMessage<PeerMessage, "tests">, peer: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { action: _, ...rest } = payload;
      setInformations((prev) => ({
        ...prev,
        [peer]: {
          ...prev[peer],
          tests: rest,
        },
      }));
    },
    []
  );

  const onOpen = React.useRef((peer: string) => async () => {
    console.log("Data Channel is open for " + peer);
    setConnection(peer, (resource) => ({
      ...resource,
      lastSeen: getUnixTs(),
    }));

    getCodeMessagePayload({}).then((fn) => fn(peer, getConnection()[peer]));
    getTestsMessagePayload()(peer, getConnection()[peer]);
    setPeerState((prev) => ({
      ...prev,
      [peer]: {
        latency: 0,
        finished: false,
      },
    }));
  });

  const onClose = React.useRef(
    (peer: string) => () => evictConnection(peer)
  ).current;

  const onmessage = React.useCallback(
    (peer: string) =>
      function (event: MessageEvent) {
        const payload: PeerMessage = JSON.parse(event.data ?? {});
        // console.log("Message from " + peer, payload);
        const { action, timestamp } = payload;

        switch (action) {
          case "code": {
            receiveCode(payload, peer);
            break;
          }

          case "tests": {
            receiveTests(payload, peer);
            break;
          }

          case "heartbeat": {
            break;
          }

          case "event": {
            const { event, eventMessage } = payload;
            switch (event) {
              case EventType.SUBMIT_SUCCESS:
                toast.success(`Update: ${eventMessage}`);
                break;
              case EventType.SUBMIT_FAILURE:
                toast.error(`Update: ${eventMessage}`);
                break;
              default:
                console.error("Unknown event", event);
                break;
            }
            break;
          }

          default:
            console.error("Unknown payload", payload);
            break;
        }
        setConnection(peer, (resource) => ({
          ...resource,
          lastSeen: timestamp,
        }));
      },

    [receiveCode, receiveTests, setConnection]
  );

  const createRoom = async ({ roomId, roomName, isPublic }: CreateRoom) => {
    const newRoomRef = getRoomRef(roomId);
    const newRoomId = newRoomRef.id;
    const sessionRef = getSessionRef(newRoomId, sessionId);
    await setRoom(newRoomRef, {
      usernames: arrayUnion(username),
      roomName,
      isPublic,
    });
    await setSession(sessionRef, {
      finishedUsers: [],

      usernames: arrayUnion(username),
      nextQuestion: "",

      createdAt: serverTimestamp(),
    });
    console.log("Created room", newRoomId);
    setRoomId(newRoomId);
    navigator.clipboard.writeText(newRoomId);
    toast.success(`Session ID ${newRoomId} copied to clipboard`);
  };

  const createOffer = React.useCallback(
    async (roomId: string, peer: string) => {
      console.log("Create Offer to", peer);
      const meRef = getSessionPeerConnectionRef(
        roomId,
        sessionId,
        peer,
        username
      );
      const pc = new RTCPeerConnection(servers);

      const channel = pc.createDataChannel("channel");
      registerConnection(
        peer,
        {
          username: peer,
          pc: pc,
          channel: channel,
          lastSeen: getUnixTs(),
        },
        (connection) => connection.pc.close()
      );

      channel.onmessage = onmessage(peer);
      channel.onopen = onOpen.current(peer);
      channel.onclose = onClose(peer);

      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          setSessionPeerConnection(meRef, {
            offerCandidates: arrayUnion(event.candidate.toJSON()),
          });
        }
      };

      const offerDescription = await pc.createOffer();
      await pc.setLocalDescription(offerDescription);

      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      };
      await setSessionPeerConnection(meRef, {
        username: username,
        offer: offer,
      });

      const unsubscribe = onSnapshot(meRef, (doc) => {
        const maybeData = doc.data();
        if (maybeData == undefined) return;

        if (
          maybeData?.answer != undefined &&
          pc.currentRemoteDescription == null
        ) {
          pc.setRemoteDescription(new RTCSessionDescription(maybeData.answer));
        }

        maybeData.answerCandidates.forEach((candidate: RTCIceCandidateInit) => {
          pc.addIceCandidate(new RTCIceCandidate(candidate));
        });
      });

      registerSnapshot(peer, unsubscribe, (prev) => prev());
    },
    [
      username,
      onmessage,
      registerSnapshot,
      registerConnection,
      sessionId,
      onClose,
    ]
  );

  const joinRoomInternal = React.useCallback(
    async (roomId: string): Promise<boolean> => {
      console.log("Joining room", roomId);
      if (!roomId) {
        toast.error("Please enter room ID");
        return false;
      }
      const roomDoc = await getRoom(roomId);
      if (!roomDoc.exists()) {
        toast.error("Room does not exist");
        return false;
      }
      if (roomDoc.data().usernames.length >= MAX_CAPACITY) {
        console.log("The room is at max capacity");
        toast.error("This room is already at max capacity.");
        return false;
      }

      await setRoom(getRoomRef(roomId), {
        usernames: arrayUnion(username),
      });
      setRoomId(roomId);
      const sessionDoc = await getSession(roomId, sessionId);
      if (!sessionDoc.exists()) {
        toast.error("Session does not exist");
        return false;
      }
      await setSession(getSessionRef(roomId, sessionId), {
        usernames: arrayUnion(username),
      });

      const unsubscribe = onSnapshot(
        getSessionPeerConnectionRefs(roomId, sessionId, username),
        (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === "removed") {
              return;
            }

            const data = change.doc.data();
            const peer = data.username;

            if (peer == undefined) {
              return;
            }

            const themRef = getSessionPeerConnectionRef(
              roomId,
              sessionId,
              username,
              peer
            );
            const pc =
              getConnection()[peer]?.pc ?? new RTCPeerConnection(servers);
            if (getConnection()[peer] == undefined) {
              const resource = {
                username: peer,
                pc: pc,
                channel: pc.createDataChannel("channel"),
                lastSeen: getUnixTs(),
              };
              registerConnection(peer, resource, (connection) =>
                connection.pc.close()
              );
              pc.ondatachannel = (event) => {
                resource.channel = event.channel;
                resource.channel.onmessage = onmessage(peer);
                resource.channel.onopen = onOpen.current(peer);
              };
              pc.onicecandidate = async (event) => {
                if (event.candidate) {
                  await setSessionPeerConnection(themRef, {
                    answerCandidates: arrayUnion(event.candidate.toJSON()),
                  });
                }
              };
            }

            if (data.offer != undefined && pc.remoteDescription == null) {
              await pc.setRemoteDescription(
                new RTCSessionDescription(data.offer)
              );

              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              await setSessionPeerConnection(themRef, {
                answer: answer,
              });
            }

            data.offerCandidates.forEach((candidate: RTCIceCandidateInit) => {
              pc.addIceCandidate(new RTCIceCandidate(candidate));
            });
          });
        }
      );

      registerSnapshot(username, unsubscribe, (prev) => prev());

      if (getLocalStorage("tabs")?.roomId !== roomId.toString()) {
        toast.success(
          `You have successfully joined the room with ID ${roomId}.`
        );
      }
      return true;
    },
    [
      username,
      onmessage,
      registerSnapshot,
      registerConnection,
      getConnection,
      sessionId,
    ]
  );

  const joinRoom = React.useCallback(
    (roomId: string) => {
      try {
        return joinRoomInternal(roomId);
      } catch {
        toast.error("Failed to join room");
        setAppState(AppState.HOME);
        return Promise.resolve(false);
      }
    },
    [joinRoomInternal, setAppState]
  );

  const leaveRoom = React.useCallback(
    async (roomId: string | null, reload = false) => {
      if (roomId == null) return;
      console.log("Leaving room", roomId);
      if (!reload) {
        console.log("Cleaning up local storage");
        clearLocalStorage();
      }

      try {
        const roomDoc = (await getRoom(roomId)).data();
        const roomQuestions = await getAllSessionId(roomId);
        if (!roomDoc) return;
        const batch = writeBatch(firestore);
        await Promise.all(
          roomQuestions.map(async (curQuestionId: string) => {
            batch.update(getSessionRef(roomId, curQuestionId), {
              usernames: arrayRemove(username),
            });

            const myAnswers = await getDocs(
              getSessionPeerConnectionRefs(roomId, curQuestionId, username)
            );
            myAnswers.docs.forEach((doc) => batch.delete(doc.ref));
          })
        );
        await batch.commit();
        if (!reload) {
          await setRoom(getRoomRef(roomId), {
            usernames: arrayRemove(username),
          });
        }
      } catch (e: unknown) {
        console.error("Failed to leave room", e);
      }

      cleanupSnapshot();
      cleanupConnection();
      setRoomId(null);
      setInformations({});
      setPeerState({});
    },
    [username, cleanupSnapshot, cleanupConnection]
  );

  const handleSucessfulSubmission = React.useCallback(async () => {
    if (!roomId) return;

    sendMessageToAll(
      withPayload({
        action: "event",
        event: EventType.SUBMIT_SUCCESS,
        eventMessage: `User ${username} passed all test cases for ${roomId}`,
      })
    );
    const sessionDoc = await getSession(roomId, sessionId);
    const sessionData = sessionDoc.data();
    if (!sessionData) return;
    await setSession(getSessionRef(roomId, sessionId), {
      finishedUsers: arrayUnion(username),
    });
  }, [username, sessionId, roomId, sendMessageToAll]);

  const handleFailedSubmission = React.useCallback(async () => {
    if (!roomId || !sessionId) return;

    sendMessageToAll(
      withPayload({
        action: "event",
        event: EventType.SUBMIT_FAILURE,
        eventMessage: `User ${username} failed some test cases for ${roomId}`,
      })
    );
  }, [username, sessionId, roomId, sendMessageToAll]);

  const deletePeers = React.useCallback(
    async (peers: string[]) => {
      if (peers.length === 0 || roomIdRef.current! == null) return;

      peers.forEach(evictConnection);
      const batch = writeBatch(firestore);
      peers.forEach((peer) => {
        batch.delete(
          getSessionPeerConnectionRef(
            roomIdRef.current!,
            sessionId,
            username,
            peer
          )
        );
        batch.delete(getRoomUserRef(roomIdRef.current!, peer));
      });
      batch.update(getSessionRef(roomIdRef.current, sessionId), {
        usernames: arrayRemove(...peers),
      });
      batch.update(getRoomRef(roomIdRef.current), {
        usernames: arrayRemove(...peers),
      });
      await batch.commit();
      setInformations((prev) =>
        Object.fromEntries(
          Object.entries(prev).filter(([key]) => !peers.includes(key))
        )
      );
      setPeerState((prev) =>
        Object.fromEntries(
          Object.entries(prev).filter(([key]) => !peers.includes(key))
        )
      );
    },
    [username, evictConnection, sessionId]
  );

  const deleteMe = React.useCallback(async () => {
    if (roomId) {
      await setSession(getSessionRef(roomId, sessionId), {
        usernames: arrayRemove(username),
      });
      console.log("Before Reloading", roomId);
    }
  }, [roomId, username, sessionId]);

  const handleChooseQuestion = React.useCallback(
    async (questionURL: string) => {
      if (!roomId) return;
      const chosenQuestionId = getQuestionIdFromUrl(questionURL);
      console.log("Choose question URL", questionURL);
      toast.info("You have selected question " + chosenQuestionId);
      if (roomId == null) return;
      // todo(nickbar01234): Firebase security rule that should reject this write
      await setSession(getSessionRef(roomId, sessionId), {
        nextQuestion: chosenQuestionId,
      });
      const newSessionRef = getSessionRef(roomId, chosenQuestionId);
      await setSession(newSessionRef, {
        finishedUsers: [],
        usernames: [],
        nextQuestion: "",
        createdAt: serverTimestamp(),
      });
    },
    [sessionId, roomId]
  );

  const roomIdRef = React.useRef(roomId);
  const deletePeersRef = React.useRef(deletePeers);
  const deleteMeRef = React.useRef(deleteMe);
  const handleSucessfulSubmissionRef = React.useRef(handleSucessfulSubmission);
  const handleFailedSubmissionRef = React.useRef(handleFailedSubmission);

  const afterReloadJoin = React.useCallback(async () => {
    const refreshInfo = getLocalStorage("tabs");
    if (refreshInfo == undefined) return;
    const prevRoomId = refreshInfo.roomId;
    // todo(nickbar01234): Dummy fix to mitigate a race
    // 1. User A reload and triggers leave room
    // 2. User B detects that A leaves the room and attempts to delete peer from local state
    // 3. User A join sessions before (2) is completed
    // 4. User B haven't finished cleaning A from local state
    // 5. User A doesn't receive an offer
    leaveRoom(prevRoomId, true)
      .then(() => wait(1500))
      .then(() => joinRoom(prevRoomId));
  }, [joinRoom, leaveRoom]);

  const joiningBackRoom = React.useCallback(async () => {
    const refreshInfo = getLocalStorage("tabs");
    if (refreshInfo == undefined) return;
    console.log("Joining back room", refreshInfo);
    const prevRoomId = refreshInfo.roomId;
    const allQuestions = await getAllSessionId(prevRoomId);
    const lastQuestionId = allQuestions[allQuestions.length - 1];
    const currentQuestionId = getQuestionIdFromUrl(window.location.href);
    console.log("Last question ID", lastQuestionId);
    if (!allQuestions.includes(currentQuestionId)) {
      setLocalStorage("navigate", "true");
      toast.info('Redirecting to the last question "' + lastQuestionId + '"');
      history.pushState(null, "", constructUrlFromQuestionId(lastQuestionId));
      location.reload();
    } else {
      toast.info('Joining back to the room "' + prevRoomId + '"');
      await afterReloadJoin();
    }
  }, [afterReloadJoin]);

  const handleNavigateToNextQuestion = React.useCallback(async () => {
    if (roomId == null) return;
    setLocalStorage("navigate", "true");
    const sessionDoc = await getSession(roomId, sessionId);
    const sessionData = sessionDoc.data();
    const nextQuestion = sessionData?.nextQuestion ?? "";
    history.pushState(null, "", constructUrlFromQuestionId(nextQuestion));
    location.reload();
  }, [roomId, sessionId]);

  React.useEffect(() => {
    if (roomId != null && getSnapshot()[roomId] == undefined) {
      const unsubscribe = onSnapshot(
        getSessionRef(roomId, sessionId),
        async (snapshot) => {
          const data = snapshot.data();
          // todo(nickbar01234): Clear and report room if deleted?
          if (data == undefined) return;

          const usernames = data.usernames;
          if (!usernames.includes(username)) return;
          const removedPeers = Object.keys(getConnection()).filter(
            (username) => !usernames.includes(username)
          );
          const addedPeers = usernames
            .slice(data.usernames.indexOf(username) + 1)
            .filter((username) => !getConnection()[username]);

          deletePeersRef.current(removedPeers);
          addedPeers.forEach((peer) => {
            createOffer(roomId, peer);
          });
          const finishedUsers = data.finishedUsers;
          setPeerState((prev) => {
            const updatedState = { ...prev };

            finishedUsers.forEach((peer) => {
              if (updatedState[peer]) {
                updatedState[peer] = {
                  ...updatedState[peer],
                  finished: true,
                };
              }
            });
            return updatedState;
          });
        }
      );
      registerSnapshot(roomId, unsubscribe, (prev) => prev());
      return () => evictSnapshot(roomId);
    }
  }, [
    roomId,
    username,
    createOffer,
    getSnapshot,
    registerSnapshot,
    getConnection,
    sessionId,
    evictSnapshot,
  ]);

  React.useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  React.useEffect(() => {
    deleteMeRef.current = deleteMe;
  }, [deleteMe]);

  useOnMount(() => {
    window.addEventListener("beforeunload", deleteMeRef.current);
    return () => {
      window.removeEventListener("beforeunload", deleteMeRef.current);
    };
  });

  React.useEffect(() => {
    const refreshInfo = getLocalStorage("tabs");
    if (appState === AppState.LOADING && refreshInfo?.roomId) {
      afterReloadJoin();
    }
  }, [afterReloadJoin, appState]);

  React.useEffect(() => {
    deletePeersRef.current = deletePeers;
  }, [deletePeers]);

  React.useEffect(() => {
    handleSucessfulSubmissionRef.current = handleSucessfulSubmission;
  }, [handleSucessfulSubmission]);

  React.useEffect(() => {
    handleFailedSubmissionRef.current = handleFailedSubmission;
  }, [handleFailedSubmission]);

  useOnMount(() => {
    const sendInterval = setInterval(sendHeartBeat, HEARTBEAT_INTERVAL);

    const checkAliveInterval = setInterval(() => {
      const currentPeers = getConnection();

      const timeOutPeers: string[] = [];
      setPeerState((prev) => {
        const newPeers = Object.fromEntries(
          Object.entries(prev).map(([peer, peerHeartBeat]) => {
            const { latency } = peerHeartBeat;
            const curlastSeen = currentPeers[peer]?.lastSeen ?? 0;
            const newSample = getUnixTs() - curlastSeen;
            if (newSample > TIMEOUT) {
              timeOutPeers.push(peer);
            }
            const newLatency = calculateNewRTT(latency, newSample);
            return [
              peer,
              {
                ...peerHeartBeat,
                latency: newLatency,
              },
            ];
          })
        );
        // Note that this race is thereotically possible
        // Time 1: User A detected B is dead and attempt to delete peer
        // User A thread to delete peer is delayed
        // Time 2: User A rejoins
        // Time 3: deletePeers is executed
        // User A gets kicked out
        // In practice, we delay the user before joining room, so it should be fine? :)
        // console.log("Dead peers", timeOutPeers);
        if (timeOutPeers.length > 0) {
          // console.log("Deleting peers", timeOutPeers);
          // deletePeersRef.current(timeOutPeers);
        }
        return newPeers;
      });
    }, CHECK_ALIVE_INTERVAL);
    return () => {
      clearInterval(checkAliveInterval);
      clearInterval(sendInterval);
    };
  });

  useOnMount(() => {
    // TODO(nickbar01234) - This is probably not rigorous enough
    const observer = new MutationObserver(() =>
      sendMessageToAll(getTestsMessagePayload())
    );
    waitForElement(CODE_MIRROR_CONTENT, 1000).then((testEditor) => {
      observer.observe(testEditor, {
        attributes: true, // Trigger code when user inputs via prettified test case console
        childList: true,
        subtree: true,
      });
    });
    return () => observer.disconnect();
  });

  useOnMount(() => {
    poll({
      fn: () => sendServiceRequest({ action: "setupLeetCodeModel" }),
      until: (response) => response.status === ResponseStatus.SUCCESS,
    });
  });

  useOnMount(() => {
    const onWindowMessage = (message: MessageEvent) => {
      // todo(nickbar01234): Should attach an ID to message so that it's identifiable only by us.
      if (message.data.action != undefined) {
        const windowMessage = message.data as WindowMessage;
        console.log("Received from window", windowMessage.action);
        switch (windowMessage.action) {
          case "leetCodeOnChange": {
            getCodeMessagePayload(windowMessage.changes).then(sendMessageToAll);
            break;
          }

          // Only for tests
          case "createRoom":
          case "joinRoom":
          case "reloadExtension":
            break;
          default:
            console.error("Unhandled window message", windowMessage);
            break;
        }
      }
    };

    window.addEventListener("message", onWindowMessage);
    return () => window.removeEventListener("message", onWindowMessage);
  });

  return (
    <RTCContext.Provider
      value={{
        createRoom,
        joinRoom,
        leaveRoom,
        roomId,
        setRoomId,
        informations,
        peerState,
        joiningBackRoom,
        handleChooseQuestion,
        handleNavigateToNextQuestion,
        deletePeers,
      }}
    >
      {props.children}
    </RTCContext.Provider>
  );
};
