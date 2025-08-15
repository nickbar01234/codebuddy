import { DOM } from "@cb/constants";
import {
  firestore,
  getAllSessionId,
  getRoom,
  getRoomRef,
  getSession,
  getSessionPeerConnectionRef,
  getSessionPeerConnectionRefs,
  getSessionRef,
  setRoom,
  setSession,
  setSessionPeerConnection,
} from "@cb/db";
import { useOnMount } from "@cb/hooks";
import { useAuthUser } from "@cb/hooks/store";
import useResource from "@cb/hooks/useResource";
import {
  clearLocalStorageForRoom,
  getLocalStorage,
  sendServiceRequest,
  setLocalStorage,
} from "@cb/services";
import { RoomStatus, roomStore } from "@cb/store";
import {
  EventType,
  ExtractMessage,
  LeetCodeContentChange,
  PeerMessage,
  WindowMessage,
} from "@cb/types";
import { Connection } from "@cb/types/utils";
import {
  constructUrlFromQuestionId,
  getQuestionIdFromUrl,
  getSessionId,
  waitForElement,
} from "@cb/utils";
import { getUnixTs } from "@cb/utils/heartbeat";
import { withPayload } from "@cb/utils/messages";
import { wait } from "@cb/utils/poll";
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
import { useStore } from "zustand";
import { additionalServers } from "./additionalServers";

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
    ...additionalServers,
  ],
  iceCandidatePoolSize: 10,
};

export const HEARTBEAT_INTERVAL = 15000; // ms
const CHECK_ALIVE_INTERVAL = 15000; // ms
const TIMEOUT = 100; // seconds;

const UNSUBSCRIBE_FIREBASE_AFTER = 60_000;

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
  joiningBackRoom: () => Promise<void>;
  handleChooseQuestion: (questionId: string) => void;
  handleNavigateToNextQuestion: () => void;
}

interface RTCProviderProps {
  children: React.ReactNode;
}

export const RTCContext = React.createContext({} as RTCContext);

export const MAX_CAPACITY = 4;

export const RTCProvider = (props: RTCProviderProps) => {
  const [roomId, setRoomId] = React.useState<null | string>(null);

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

  const {
    user: { username },
  } = useAuthUser();
  const roomStatus = useStore(roomStore, (state) => state.room.status);
  const createRoomInternal = useStore(
    roomStore,
    (state) => state.actions.createRoom
  );
  const leaveRoomInternal = useStore(
    roomStore,
    (state) => state.actions.leaveRoom
  );
  const updatePeer = useStore(roomStore, (state) => state.actions.updatePeer);
  const removePeers = useStore(roomStore, (state) => state.actions.removePeers);

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
        document.querySelector(DOM.LEETCODE_TEST_ID) as HTMLDivElement
      ).innerText.split("\n"),
    })
  ).current;

  const receiveCode = React.useCallback(
    (payload: ExtractMessage<PeerMessage, "code">, peer: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { action: _, ...code } = payload;
      updatePeer(peer, { code });
    },
    [updatePeer]
  );

  const receiveTests = React.useCallback(
    (payload: ExtractMessage<PeerMessage, "tests">, peer: string) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { action: _, ...tests } = payload;
      updatePeer(peer, { tests });
    },
    [updatePeer]
  );

  const onOpen = React.useRef((peer: string) => async () => {
    console.log("Data Channel is open for " + peer);
    setConnection(peer, (resource) => ({
      ...resource,
      lastSeen: getUnixTs(),
    }));

    getCodeMessagePayload({}).then((fn) => fn(peer, getConnection()[peer]));
    getTestsMessagePayload()(peer, getConnection()[peer]);
    updatePeer(peer, { latency: 0, finished: false });
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
                toast.success(eventMessage);
                break;
              case EventType.SUBMIT_FAILURE:
                toast.error(eventMessage);
                break;
              case EventType.SELECT_QUESTION:
                toast.info(eventMessage);
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
    const sessionRef = getSessionRef(newRoomId, getSessionId());
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
    // todo(nickbar01234): Fix type for roomName
    createRoomInternal({
      id: newRoomId,
      name: roomName ?? "",
      public: isPublic,
    });
    navigator.clipboard.writeText(newRoomId);
    toast.success(`Session ID ${newRoomId} copied to clipboard`);
  };

  const createOffer = React.useCallback(
    async (roomId: string, peer: string) => {
      console.log("Create Offer to", peer);
      const meRef = getSessionPeerConnectionRef(
        roomId,
        getSessionId(),
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

      pc.onicecandidate = (event) => {
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

      const unsubscribe = onSnapshot(
        meRef,
        async (doc) => {
          const maybeData = doc.data();
          if (maybeData == undefined) return;

          if (
            maybeData?.answer != undefined &&
            pc.currentRemoteDescription == null
          ) {
            await pc.setRemoteDescription(
              new RTCSessionDescription(maybeData.answer)
            );
          }

          maybeData.answerCandidates.forEach(
            (candidate: RTCIceCandidateInit) => {
              pc.addIceCandidate(new RTCIceCandidate(candidate));
            }
          );
        },
        (error) => {
          console.error("Received snapshot error", error.code);
          evictSnapshot(peer);
        }
      );

      registerSnapshot(peer, unsubscribe, (prev) => prev());

      // todo(nickbar01234): Not rigorous, but does the job since it's reasonable that RTC connection shouldn't take
      // that long
      setTimeout(() => {
        console.log("Unsubscribe firebase database after timeout");
        evictSnapshot(peer);
      }, UNSUBSCRIBE_FIREBASE_AFTER);
    },
    [
      username,
      onmessage,
      registerSnapshot,
      registerConnection,
      onClose,
      evictSnapshot,
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
      // todo(nickbar01234): Ask user to redirect
      const sessionDoc = await getSession(roomId, getSessionId());
      if (!sessionDoc.exists()) {
        toast.error("Session does not exist");
        return false;
      }

      setRoomId(roomId);
      await setSession(getSessionRef(roomId, getSessionId()), {
        usernames: arrayUnion(username),
      });

      const unsubscribe = onSnapshot(
        getSessionPeerConnectionRefs(roomId, getSessionId(), username),
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
              getSessionId(),
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
              pc.onicecandidate = (event) => {
                if (event.candidate) {
                  setSessionPeerConnection(themRef, {
                    answerCandidates: arrayUnion(event.candidate.toJSON()),
                  });
                }
              };
            }

            if (data.offer) {
              if (pc.remoteDescription == null)
                await pc.setRemoteDescription(
                  new RTCSessionDescription(data.offer)
                );

              if (pc.localDescription == null) {
                const answer = await pc.createAnswer();
                await pc.setLocalDescription(answer);
                await setSessionPeerConnection(themRef, {
                  answer: answer,
                });
              }
            }

            data.offerCandidates.forEach((candidate: RTCIceCandidateInit) => {
              pc.addIceCandidate(new RTCIceCandidate(candidate));
            });
          });
        },
        (error) => {
          console.error("Received snapshot error", error.code);
          evictSnapshot(username);
        }
      );

      registerSnapshot(username, unsubscribe, (prev) => prev());

      // todo(nickbar01234): Not rigorous, but does the job since it's reasonable that RTC connection shouldn't take
      // that long
      setTimeout(() => {
        console.log("Unsubscribe firebase database after timeout");
        evictSnapshot(username);
      }, UNSUBSCRIBE_FIREBASE_AFTER);

      if (getLocalStorage("tabs")?.roomId !== roomId.toString()) {
        toast.success(
          `You have successfully joined the room with ID ${roomId}.`
        );
      }

      createRoomInternal({
        id: roomId,
        public: roomDoc.data().isPublic,
        name: roomDoc.data().roomName,
      });
      return true;
    },
    [
      username,
      onmessage,
      registerSnapshot,
      registerConnection,
      getConnection,
      evictSnapshot,
      createRoomInternal,
    ]
  );

  const joinRoom = React.useCallback(
    (roomId: string) => {
      try {
        return joinRoomInternal(roomId);
      } catch {
        toast.error("Failed to join room");
        return Promise.resolve(false);
      }
    },
    [joinRoomInternal]
  );

  const leaveRoom = React.useCallback(
    async (roomId: string | null, reload = false) => {
      if (!reload) {
        console.log("Cleaning up local storage");
        clearLocalStorageForRoom();
      }

      if (roomId == null) return;
      console.log("Leaving room", roomId);

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
      } finally {
        cleanupSnapshot();
        cleanupConnection();
        setRoomId(null);
        leaveRoomInternal();
      }
    },
    [username, cleanupSnapshot, cleanupConnection, leaveRoomInternal]
  );

  const handleSucessfulSubmission = React.useCallback(async () => {
    if (!roomId) return;

    sendMessageToAll(
      withPayload({
        action: "event",
        event: EventType.SUBMIT_SUCCESS,
        eventMessage: `${username} passed all test cases`,
      })
    );
    const sessionDoc = await getSession(roomId, getSessionId());
    const sessionData = sessionDoc.data();
    if (!sessionData) return;
    await setSession(getSessionRef(roomId, getSessionId()), {
      finishedUsers: arrayUnion(username),
    });
  }, [username, roomId, sendMessageToAll]);

  const handleFailedSubmission = React.useCallback(async () => {
    if (!roomId) return;

    sendMessageToAll(
      withPayload({
        action: "event",
        event: EventType.SUBMIT_FAILURE,
        eventMessage: `${username} failed some test cases`,
      })
    );
  }, [username, roomId, sendMessageToAll]);

  const deletePeers = React.useCallback(
    async (peers: string[]) => {
      if (peers.length === 0 || roomId == null) return;

      peers.forEach(evictConnection);
      const batch = writeBatch(firestore);
      peers
        .map((peer) =>
          getSessionPeerConnectionRef(roomId, getSessionId(), username, peer)
        )
        .forEach((docRef) => batch.delete(docRef));
      batch.update(getSessionRef(roomId, getSessionId()), {
        usernames: arrayRemove(...peers),
      });
      batch.update(getRoomRef(roomId), {
        usernames: arrayRemove(...peers),
      });
      await batch.commit();
      removePeers(peers);
    },
    [roomId, username, evictConnection, removePeers]
  );

  const deleteMe = React.useCallback(async () => {
    if (roomId) {
      await setSession(getSessionRef(roomId, getSessionId()), {
        usernames: arrayRemove(username),
      });
    }
  }, [roomId, username]);

  const handleChooseQuestion = React.useCallback(
    async (questionURL: string) => {
      if (!roomId) return;
      const chosenQuestionId = getQuestionIdFromUrl(questionURL);
      toast.info("You have selected question " + chosenQuestionId);
      if (roomId == null) return;
      // todo(nickbar01234): Firebase security rule that should reject this write
      await setSession(getSessionRef(roomId, getSessionId()), {
        nextQuestion: chosenQuestionId,
      });
      const newSessionRef = getSessionRef(roomId, chosenQuestionId);
      await setSession(newSessionRef, {
        finishedUsers: [],
        usernames: [],
        nextQuestion: "",
        createdAt: serverTimestamp(),
      });
      sendMessageToAll(
        withPayload({
          action: "event",
          event: EventType.SELECT_QUESTION,
          eventMessage: `${username} selected ${chosenQuestionId}`,
        })
      );
    },
    [roomId, sendMessageToAll, username]
  );

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
    const sessionDoc = await getSession(roomId, getSessionId());
    const sessionData = sessionDoc.data();
    const nextQuestion = sessionData?.nextQuestion ?? "";
    history.pushState(null, "", constructUrlFromQuestionId(nextQuestion));
    location.reload();
  }, [roomId]);

  React.useEffect(() => {
    if (roomId != null && getSnapshot()[roomId] == undefined) {
      const unsubscribe = onSnapshot(
        getSessionRef(roomId, getSessionId()),
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
          // todo(nickbar01234): Do we need bulk update?
          finishedUsers.forEach((peer) => {
            updatePeer(peer, { finished: true });
          });
        }
      );
      registerSnapshot(roomId, unsubscribe, (prev) => prev());
      return () => {
        evictSnapshot(roomId);
      };
    }
  }, [
    roomId,
    username,
    createOffer,
    getSnapshot,
    registerSnapshot,
    getConnection,
    evictSnapshot,
    updatePeer,
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
    if (roomStatus === RoomStatus.LOADING && refreshInfo?.roomId) {
      afterReloadJoin();
    }
  }, [afterReloadJoin, roomStatus]);

  React.useEffect(() => {
    deletePeersRef.current = deletePeers;
  }, [deletePeers]);

  React.useEffect(() => {
    handleSucessfulSubmissionRef.current = handleSucessfulSubmission;
  }, [handleSucessfulSubmission]);

  React.useEffect(() => {
    handleFailedSubmissionRef.current = handleFailedSubmission;
  }, [handleFailedSubmission]);

  // todo(nickbar01234): We should refactor this
  // useOnMount(() => {
  //   const sendInterval = setInterval(sendHeartBeat, HEARTBEAT_INTERVAL);

  //   const checkAliveInterval = setInterval(() => {
  //     const currentPeers = getConnection();

  //     const timeOutPeers: string[] = [];
  //     setPeerState((prev) => {
  //       const newPeers = Object.fromEntries(
  //         Object.entries(prev).map(([peer, peerHeartBeat]) => {
  //           const { latency } = peerHeartBeat;
  //           const curlastSeen = currentPeers[peer]?.lastSeen ?? 0;
  //           const newSample = getUnixTs() - curlastSeen;
  //           if (newSample > TIMEOUT) {
  //             timeOutPeers.push(peer);
  //           }
  //           const newLatency = calculateNewRTT(latency, newSample);
  //           return [
  //             peer,
  //             {
  //               ...peerHeartBeat,
  //               latency: newLatency,
  //             },
  //           ];
  //         })
  //       );
  //       return newPeers;
  //     });
  //     // Note that this race is thereotically possible
  //     // Time 1: User A detected B is dead and attempt to delete peer
  //     // User A thread to delete peer is delayed
  //     // Time 2: User A rejoins
  //     // Time 3: deletePeers is executed
  //     // User A gets kicked out
  //     // In practice, we delay the user before joining room, so it should be fine? :)
  //     // console.log("Dead peers", timeOutPeers);
  //     if (timeOutPeers.length > 0) {
  //       console.log("Deleting peers", timeOutPeers);
  //       deletePeersRef.current(timeOutPeers);
  //     }
  //   }, CHECK_ALIVE_INTERVAL);
  //   return () => {
  //     clearInterval(checkAliveInterval);
  //     clearInterval(sendInterval);
  //   };
  // });

  useOnMount(() => {
    // TODO(nickbar01234) - This is probably not rigorous enough
    const observer = new MutationObserver(() =>
      sendMessageToAll(getTestsMessagePayload())
    );
    waitForElement(DOM.LEETCODE_TEST_ID).then((testEditor) => {
      observer.observe(testEditor, {
        attributes: true, // Trigger code when user inputs via prettified test case console
        childList: true,
        subtree: true,
      });
    });
    return () => observer.disconnect();
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
        joiningBackRoom,
        handleChooseQuestion,
        handleNavigateToNextQuestion,
      }}
    >
      {props.children}
    </RTCContext.Provider>
  );
};
