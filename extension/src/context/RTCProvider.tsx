import {
  LEETCODE_SUBMISSION_RESULT,
  LEETCODE_SUBMIT_BUTTON,
} from "@cb/constants/page-elements";
import {
  firestore,
  getRoom,
  getRoomPeerConnectionRef,
  getRoomPeerConnectionRefs,
  getRoomRef,
  setRoom,
  setRoomPeerConnection,
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
import { poll } from "@cb/utils/poll";
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  getDocs,
  onSnapshot,
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
const CHECK_ALIVE_INTERVAL = 1000; // ms
const TIMEOUT = 100; // seconds;

interface CreateRoom {
  roomId?: string;
}

export interface RTCContext {
  createRoom: (args: CreateRoom) => void;
  joinRoom: (roomId: string) => Promise<boolean>;
  leaveRoom: (roomId: string | null) => Promise<void>;
  roomId: string | null;
  setRoomId: (id: string) => void;
  informations: Record<string, PeerInformation>;
  peerState: Record<string, PeerState>;
  joiningBackRoom: (join: boolean) => Promise<void>;
  roomState: ROOMSTATE | null;
  handleChooseQuestion: (questionId: string) => void;
  chooseQuestion: string | null;
}

interface RTCProviderProps {
  children: React.ReactNode;
}

export enum ROOMSTATE {
  CODE,
  CHOOSE,
  WAIT,
}

export const RTCContext = React.createContext({} as RTCContext);

export const MAX_CAPACITY = 4;

export const RTCProvider = (props: RTCProviderProps) => {
  const {
    user: { username },
  } = useAppState();
  const [roomId, setRoomId] = React.useState<null | string>(null);
  const { state: appState } = useAppState();
  const [informations, setInformations] = React.useState<
    Record<string, PeerInformation>
  >({});
  const [peerState, setPeerState] = React.useState<Record<string, PeerState>>(
    {}
  );
  const [roomState, setRoomState] = React.useState<ROOMSTATE | null>(null);
  const [chooseQuestion, setChooseQuestion] = React.useState<string | null>(
    null
  );
  // console.log("chooseQuestion", chooseQuestion);

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
  } = useResource<Unsubscribe>({ name: "snapshot" });

  useOnMount(() => {
    waitForElement(LEETCODE_SUBMIT_BUTTON, 2000)
      .then((button) => button as HTMLButtonElement)
      .then((button) => {
        const originalOnClick = button.onclick;
        button.onclick = function (event) {
          if (originalOnClick) {
            originalOnClick.call(this, event);
          }

          waitForElement(LEETCODE_SUBMISSION_RESULT, 10000)
            .then(() => handleSucessfulSubmissionRef.current())
            .catch(() => handleFailedSubmissionRef.current());
        };
      })
      .catch((error) => {
        console.error("Error mounting callback on submit code button:", error);
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
        deviation: 0,
        connected: true,
      },
    }));
  });

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

  const createRoom = async ({ roomId }: CreateRoom) => {
    const questionId = getQuestionIdFromUrl(window.location.href);
    const roomRef = getRoomRef(roomId);
    await setRoom(roomRef, {
      questionMap: {
        [questionId]: {
          currentUsers: [],
          finishedUsers: [],
        },
      },
      nextQuestion: "",
      usernames: arrayUnion(username),
    });
    console.log("Created room");
    setRoomId(roomRef.id);
    navigator.clipboard.writeText(roomRef.id);
    setRoomState(ROOMSTATE.CODE);
    toast.success(`Room ID ${roomRef.id} copied to clipboard`);
  };

  const createOffer = React.useCallback(
    async (roomId: string, peer: string) => {
      console.log("Create Offer to", peer);
      const meRef = getRoomPeerConnectionRef(roomId, peer, username);
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

      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          setRoomPeerConnection(meRef, {
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
      await setRoomPeerConnection(meRef, {
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
    [username, onmessage, registerSnapshot, registerConnection]
  );

  const joinRoom = React.useCallback(
    async (roomId: string): Promise<boolean> => {
      const questionId = getQuestionIdFromUrl(window.location.href);
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
      const roomQuestionId = Object.keys(roomDoc.data().questionMap);
      if (roomQuestionId.length === 0 || !roomQuestionId.includes(questionId)) {
        const listOfQuestions = roomQuestionId.map((id) =>
          constructUrlFromQuestionId(id)
        );
        toast.error("The room you join begin on this question:", {
          description: listOfQuestions.join(", "),
        });
        return false;
      }
      const usernames = roomDoc.data().usernames;
      if (usernames.length >= MAX_CAPACITY) {
        console.log("The room is at max capacity");
        toast.error("This room is already at max capacity.");
        return false;
      }
      // console.log("Joining room", roomId);
      setRoomId(roomId);
      await setRoom(getRoomRef(roomId), {
        usernames: arrayUnion(username),
      });
      const nextQuestion = roomDoc.data().nextQuestion;
      if (nextQuestion !== "") {
        setChooseQuestion(nextQuestion);
      }

      const unsubscribe = onSnapshot(
        getRoomPeerConnectionRefs(roomId, username),
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

            const themRef = getRoomPeerConnectionRef(roomId, username, peer);
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
                  await setRoomPeerConnection(themRef, {
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
              await setRoomPeerConnection(themRef, {
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
      setRoomState(ROOMSTATE.CODE);
      return true;
    },
    [username, onmessage, registerSnapshot, registerConnection, getConnection]
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
        await setRoom(getRoomRef(roomId), {
          usernames: arrayRemove(username),
        });

        const myAnswers = await getDocs(
          getRoomPeerConnectionRefs(roomId, username)
        );
        myAnswers.docs.forEach(async (doc) => {
          deleteDoc(doc.ref);
        });
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
    if (roomId == null) return;

    const questionId = getQuestionIdFromUrl(window.location.href);
    sendMessageToAll(
      withPayload({
        action: "event",
        event: EventType.SUBMIT_SUCCESS,
        eventMessage: `User ${username} passed all test cases for ${questionId}`,
      })
    );
    await setRoom(getRoomRef(roomId), {
      questionMap: {
        [questionId]: {
          currentUsers: arrayRemove(username),
          finishedUsers: arrayUnion(username),
        },
      },
    });
    const roomDoc = await getRoom(roomId);
    const roomData = roomDoc.data();
    if (!roomData) return;
    const questionMap = roomData.questionMap;
    const nextQuestion = roomData.nextQuestion;
    const finsishedUsers = questionMap[questionId]?.finishedUsers;
    console.log("Next question", nextQuestion);
    if (nextQuestion === "") {
      if (
        finsishedUsers &&
        finsishedUsers.length !== 0 &&
        username === finsishedUsers[0]
      ) {
        setRoomState(ROOMSTATE.CHOOSE);
      }
    } else {
      console.log("TO WAIT");
      setRoomState(ROOMSTATE.WAIT);
    }
  }, [username, roomId]);

  const handleFailedSubmission = React.useCallback(async () => {
    if (roomId == null) return;
    const questionId = getQuestionIdFromUrl(window.location.href);
    sendMessageToAll(
      withPayload({
        action: "event",
        event: EventType.SUBMIT_FAILURE,
        eventMessage: `User ${username} failed some test cases for ${questionId}`,
      })
    );
  }, [username, roomId]);

  const deletePeers = React.useCallback(
    async (peers: string[]) => {
      if (roomId == null) return;
      peers.forEach(evictConnection);
      const batch = writeBatch(firestore);
      peers
        .map((peer) => getRoomPeerConnectionRef(roomId, username, peer))
        .forEach((docRef) => batch.delete(docRef));
      batch.update(getRoomRef(roomId), {
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
      // console.log("Removed peers", peers);
    },
    [roomId, username, evictConnection]
  );

  const deleteMe = React.useCallback(async () => {
    if (roomId) {
      await setRoom(getRoomRef(roomId), {
        usernames: arrayRemove(username),
      });
      console.log("Before Reloading", roomId);
    }
  }, [roomId, username]);

  const handleChooseQuestion = React.useCallback(
    async (questionId: string) => {
      if (roomId == null) return;
      await setRoom(getRoomRef(roomId), {
        nextQuestion: questionId,
      });
      setRoomState(ROOMSTATE.WAIT);
    },
    [roomId]
  );

  const deletePeersRef = React.useRef(deletePeers);
  const deleteMeRef = React.useRef(deleteMe);
  const handleSucessfulSubmissionRef = React.useRef(handleSucessfulSubmission);
  const handleFailedSubmissionRef = React.useRef(handleFailedSubmission);

  const joiningBackRoom = React.useCallback(
    async (join: boolean) => {
      const refreshInfo = getLocalStorage("tabs");
      if (refreshInfo == undefined) return;
      const prevRoomId = refreshInfo.roomId;
      await leaveRoom(prevRoomId, join);
      // todo(nickbar01234): Dummy fix to mitigate a race
      // 1. User A reload and triggers leave room
      // 2. User B detects that A leaves the room and attempts to delete peer from local state
      // 3. User A join rooms before (2) is completed
      // 4. User B haven't finished cleaning A from local state
      // 5. User A doesn't receive an offer
      if (join) {
        setTimeout(() => {
          joinRoom(prevRoomId);
        }, 1500);
      }
    },
    [joinRoom, leaveRoom]
  );

  React.useEffect(() => {
    if (roomId != null && getSnapshot()[roomId] == undefined) {
      const unsubscribe = onSnapshot(getRoomRef(roomId), (snapshot) => {
        const data = snapshot.data();
        // todo(nickbar01234): Clear and report room if deleted?
        if (data == undefined) return;
        const usernames = data.usernames;
        if (!usernames.includes(username)) return;

        const nextQuestion = data.nextQuestion;
        const questionId = getQuestionIdFromUrl(window.location.href);
        const finishedUsers = data.questionMap[questionId]?.finishedUsers;
        console.log("finishedUsers", finishedUsers);
        if (
          usernames.every((user) => finishedUsers.includes(user)) &&
          nextQuestion !== ""
        ) {
          toast.info(
            "All users have finished the question. " +
              "Navigating to the next question: " +
              constructUrlFromQuestionId(nextQuestion)
          );

          setChooseQuestion(nextQuestion);
        }
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

        removedPeers.forEach((peer) => {
          toast.error(`${peer} has left the room`);
        });
      });
      registerSnapshot(roomId, unsubscribe, (prev) => prev());
    }
  }, [
    roomId,
    username,
    createOffer,
    getSnapshot,
    registerSnapshot,
    getConnection,
  ]);

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
    console.log("Joining back room", appState, refreshInfo?.roomId);
    if (appState === AppState.LOADING && refreshInfo?.roomId) {
      joiningBackRoom(true);
    }
  }, [joiningBackRoom, appState]);

  React.useEffect(() => {
    deletePeersRef.current = deletePeers;
  }, [deletePeers]);

  React.useEffect(() => {
    handleSucessfulSubmissionRef.current = handleSucessfulSubmission;
  }, [handleSucessfulSubmission]);

  React.useEffect(() => {
    handleFailedSubmissionRef.current = handleFailedSubmission;
  }, [handleFailedSubmission]);

  React.useEffect(() => {
    if (roomState == null) return;
    setLocalStorage("roomState", roomState.toString());
  }, [roomState]);

  useOnMount(() => {
    const roomState = getLocalStorage("roomState");
    if (roomState != undefined) {
      setRoomState(parseInt(roomState));
    }
  });

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
        return newPeers;
      });

      // Note that this race is thereotically possible
      // Time 1: User A detected B is dead and attempt to delete peer
      // User A thread to delete peer is delayed
      // Time 2: User A rejoins
      // Time 3: deletePeers is executed
      // User A gets kicked out
      // In practice, we delay the user before joining room, so it should be fine? :)
      // console.log("Dead peers", timeOutPeers);
      deletePeersRef.current(timeOutPeers);
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
        roomState,
        handleChooseQuestion,
        chooseQuestion,
      }}
    >
      {props.children}
    </RTCContext.Provider>
  );
};
