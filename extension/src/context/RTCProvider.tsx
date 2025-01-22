import {
  LEETCODE_SUBMISSION_RESULT,
  LEETCODE_SUBMIT_BUTTON,
} from "@cb/constants/page-elements";
import db, { firestore } from "@cb/db";
import { useAppState, useOnMount } from "@cb/hooks";
import {
  clearLocalStorage,
  getLocalStorage,
  sendServiceRequest,
} from "@cb/services";
import {
  EventType,
  ExtractMessage,
  LeetCodeContentChange,
  PeerInformation,
  PeerMessage,
  PeerState,
  WindowMessage,
} from "@cb/types";
import {
  constructUrlFromQuestionId,
  getQuestionIdFromUrl,
  waitForElement,
} from "@cb/utils";
import { calculateNewRTT, getUnixTs } from "@cb/utils/heartbeat";
import {
  arrayRemove,
  arrayUnion,
  deleteDoc,
  getDocs,
  onSnapshot,
  setDoc,
  Unsubscribe,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import React from "react";
import { toast } from "sonner";
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

const CODE_MIRROR_CONTENT = ".cm-content";

const HEARTBEAT_INTERVAL = 30_000; // ms
const CHECK_ALIVE_INTERVAL = 30_000; // ms
const TIMEOUT = 120; // seconds;

interface CreateRoom {
  roomId?: string;
}

export interface RTCContext {
  createRoom: (args: CreateRoom) => void;
  joinRoom: (roomId: string) => Promise<boolean>;
  leaveRoom: (roomId: string) => Promise<void>;
  roomId: string | null;
  setRoomId: (id: string) => void;
  informations: Record<string, PeerInformation>;
  peerState: Record<string, PeerState>;
  joiningBackRoom: (join: boolean) => Promise<void>;
}

interface RTCProviderProps {
  children: React.ReactNode;
}

export const RTCContext = React.createContext({} as RTCContext);

interface Connection {
  username: string;
  pc: RTCPeerConnection;
  channel: RTCDataChannel;
  lastSeen: number;
}

interface SendMessage<T> {
  peer?: string;
  // todo(nickbar01234): Make payload optional
  payload: T;
}

export const MAX_CAPACITY = 4;

export const RTCProvider = (props: RTCProviderProps) => {
  const {
    user: { username },
  } = useAppState();
  const pcs = React.useRef<Record<string, Connection>>({});
  const unsubscribeRef = React.useRef<null | Unsubscribe>(null);
  const [roomId, setRoomId] = React.useState<null | string>(null);
  const { navigationEntry } = useAppState();
  const [informations, setInformations] = React.useState<
    Record<string, PeerInformation>
  >({});
  const [peerState, setPeerState] = React.useState<Record<string, PeerState>>(
    {}
  );

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
            .then(() => {
              sendMessagesRef.current({
                peer: undefined,
                payload: {
                  action: "event",
                  event: EventType.SUBMIT_SUCCESS,
                  eventMessage: `User ${username} passed all test cases`,
                  timestamp: getUnixTs(),
                },
              });
            })
            .catch(() => {
              sendMessagesRef.current({
                peer: undefined,
                payload: {
                  action: "event",
                  event: EventType.SUBMIT_FAILURE,
                  eventMessage: `User ${username} failed some test cases`,
                  timestamp: getUnixTs(),
                },
              });
            });
        };
      })
      .catch((error) => {
        console.error("Error mounting callback on submit code button:", error);
      });
  });

  const replacePeerState = React.useCallback(
    (
      peer: string,
      override: ((state: PeerState) => PeerState) | Partial<PeerState>
    ) => {
      if (peer != undefined) {
        const delegate = (state: PeerState) => {
          return typeof override === "function"
            ? override(state)
            : { ...state, ...override };
        };
        setPeerState((prev) =>
          Object.fromEntries(
            Object.entries(prev).map(([key, value]) =>
              key === peer ? [key, delegate(value)] : [key, value]
            )
          )
        );
      }
    },
    []
  );

  const sendMessageRef = React.useRef(
    (peer: string) => (payload: PeerMessage) => {
      if (
        pcs.current[peer].channel !== undefined &&
        pcs.current[peer].channel.readyState === "open"
      ) {
        pcs.current[peer].channel.send(JSON.stringify(payload));
      } else if (!Object.keys(pcs.current).includes(peer)) {
        console.log("Not connected to " + peer);
      } else {
        console.log("Data Channel not created yet");
      }
    }
  );

  const sendMessagesRef = React.useRef(
    ({ peer, payload }: SendMessage<PeerMessage>) => {
      if (peer != undefined) {
        sendMessageRef.current(peer)(payload);
      } else {
        Object.keys(pcs.current)
          .map(sendMessageRef.current)
          .forEach((cb) => cb(payload));
      }
    }
  );

  const sendHeartBeatRef = React.useRef(() =>
    sendMessagesRef.current({
      payload: { action: "heartbeat", timestamp: getUnixTs() },
    })
  );

  const sendCodeRef = React.useRef(
    async ({
      peer,
      payload: changes,
    }: SendMessage<LeetCodeContentChange | undefined>) => {
      sendMessagesRef.current({
        peer,
        payload: {
          action: "code",
          code: await sendServiceRequest({ action: "getValue" }),
          changes: JSON.stringify(changes ?? {}),
          timestamp: getUnixTs(),
        },
      });
    }
  );

  const sendTestsRef = React.useRef(
    async ({ peer }: SendMessage<undefined>) => {
      const node = document.querySelector(
        CODE_MIRROR_CONTENT
      ) as HTMLDivElement;
      if (node != null) {
        sendMessagesRef.current({
          peer,
          payload: {
            action: "tests",
            tests: node.innerText.split("\n"),
            timestamp: getUnixTs(),
          },
        });
      }
    }
  );

  const receiveHeartBeat = React.useCallback(
    (peer: string) => {
      replacePeerState(peer, (peerHeartBeat) => {
        const { latency } = peerHeartBeat;
        const curlastSeen = pcs.current[peer]?.lastSeen ?? 0;
        const newSample = getUnixTs() - curlastSeen;
        const newLatency = calculateNewRTT(latency, newSample);
        return {
          ...peerHeartBeat,
          latency: newLatency,
        };
      });
    },
    [replacePeerState]
  );

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

  const onOpen = React.useRef((peer: string) => () => {
    console.log("Data Channel is open for " + peer);
    pcs.current[peer].lastSeen = getUnixTs();
    sendCodeRef.current({ peer, payload: undefined });
    sendTestsRef.current({ peer, payload: undefined });
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (peer: string) =>
      function (event: MessageEvent) {
        const payload: PeerMessage = JSON.parse(event.data ?? {});
        console.log("Message from " + peer, payload);
        const { action, timestamp } = payload;
        if (Object.keys(pcs.current).includes(peer)) {
          pcs.current[peer].lastSeen = timestamp;
        }

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
            receiveHeartBeat(peer);
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
      },
    [receiveCode, receiveTests, receiveHeartBeat]
  );

  const createRoom = async ({ roomId }: CreateRoom) => {
    const questionId = getQuestionIdFromUrl(window.location.href);
    const roomRef =
      roomId == undefined ? db.rooms().ref() : db.rooms().doc(roomId).ref();
    await setDoc(
      roomRef,
      { questionId, usernames: arrayUnion(username) },
      { merge: true }
    );
    console.log("Created room");
    setRoomId(roomRef.id);
    navigator.clipboard.writeText(roomRef.id);
    toast.success(`Room ID ${roomRef.id} copied to clipboard`);
  };

  const createOffer = React.useCallback(
    async (roomId: string, peer: string) => {
      console.log("Create Offer to", peer);
      const meRef = db.connections(roomId, peer).doc(username);

      const pc = new RTCPeerConnection(servers);

      const channel = pc.createDataChannel("channel");
      pcs.current[peer] = {
        username: peer,
        pc: pc,
        channel: channel,
        lastSeen: getUnixTs(),
      };

      channel.onmessage = onmessage(peer);
      channel.onopen = onOpen.current(peer);

      pc.onicecandidate = async (event) => {
        if (event.candidate) {
          await setDoc(
            meRef,
            {
              offerCandidates: arrayUnion(event.candidate.toJSON()),
            },
            { merge: true }
          );
        }
      };

      const offerDescription = await pc.createOffer();
      await pc.setLocalDescription(offerDescription);

      const offer = {
        sdp: offerDescription.sdp,
        type: offerDescription.type,
      };
      await setDoc(
        meRef,
        {
          username: username,
          offer: offer,
        },
        { merge: true }
      );

      onSnapshot(meRef, (doc) => {
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
    },
    [username, onmessage]
  );

  const joinRoom = React.useCallback(
    async (roomId: string): Promise<boolean> => {
      const questionId = getQuestionIdFromUrl(window.location.href);
      console.log("Joining room", roomId);
      if (!roomId) {
        toast.error("Please enter room ID");
        return false;
      }

      const roomDoc = await db.room(roomId).doc();
      if (!roomDoc.exists()) {
        toast.error("Room does not exist");
        return false;
      }
      const roomQuestionId = roomDoc.data().questionId;
      if (questionId !== roomQuestionId) {
        const questionUrl = constructUrlFromQuestionId(roomQuestionId);
        toast.error("The room you join is on this question:", {
          description: questionUrl,
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
      await updateDoc(db.room(roomId).ref(), {
        usernames: arrayUnion(username),
      });

      onSnapshot(db.connections(roomId, username).ref(), (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "removed") {
            return;
          }

          const data = change.doc.data();
          const peer = data.username;

          if (peer == undefined) {
            return;
          }

          const themRef = db.connections(roomId, username).doc(peer);
          const pc = pcs.current[peer]?.pc ?? new RTCPeerConnection(servers);
          if (pcs.current[peer] == undefined) {
            pcs.current[peer] = {
              username: peer,
              pc: pc,
              channel: pc.createDataChannel("channel"),
              lastSeen: getUnixTs(),
            };
            pc.ondatachannel = (event) => {
              pcs.current[peer].channel = event.channel;
              pcs.current[peer].channel.onmessage = onmessage(peer);
              pcs.current[peer].channel.onopen = onOpen.current(peer);
            };
            pc.onicecandidate = async (event) => {
              if (event.candidate) {
                await updateDoc(themRef, {
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
            await updateDoc(themRef, { answer: answer });
          }

          data.offerCandidates.forEach((candidate: RTCIceCandidateInit) => {
            pc.addIceCandidate(new RTCIceCandidate(candidate));
          });
        });
      });

      if (getLocalStorage("tabs")?.roomId !== roomId.toString()) {
        toast.success(
          `You have successfully joined the room with ID ${roomId}.`
        );
      }
      localStorage.removeItem("refresh");
      return true;
    },
    [username, onmessage]
  );

  const leaveRoom = React.useCallback(
    async (roomId: string, reload = false) => {
      console.log("Leaving room", roomId);
      if (!reload) {
        console.log("Cleaning up local storage");
        clearLocalStorage();
      }

      try {
        await updateDoc(db.room(roomId).ref(), {
          usernames: arrayRemove(username),
        });

        const myAnswers = await getDocs(db.connections(roomId, username).ref());
        myAnswers.docs.forEach(async (doc) => {
          deleteDoc(doc.ref);
        });
      } catch (e: unknown) {
        console.error("Failed to leave room", e);
      }
      setRoomId(null);
      setInformations({});
      setPeerState({});
      setPeerState({});
      pcs.current = {};
    },
    [username]
  );

  // modify to accept many peers.
  const deletePeers = React.useCallback(
    async (peers: string[]) => {
      if (roomId == null) return;
      if (peers == undefined) return;
      const batch = writeBatch(firestore);
      peers
        .map((peer) => db.connections(roomId, username).doc(peer))
        .forEach((docRef) => batch.delete(docRef));
      batch.update(db.room(roomId).ref(), {
        usernames: arrayRemove(...peers),
      });
      await batch.commit();
      const updatedPcs = { ...pcs.current };
      peers.forEach((peer) => {
        delete updatedPcs[peer];
      });
      pcs.current = updatedPcs;
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
      console.log("Removed peers", peers);
    },
    [roomId, username]
  );

  const deleteMe = React.useCallback(async () => {
    if (roomId) {
      await updateDoc(db.room(roomId).ref(), {
        usernames: arrayRemove(username),
      });
      console.log("Before Reloading", roomId);
    }
  }, [roomId, username]);

  const receiveHeartBeatRef = React.useRef(receiveHeartBeat);
  const deletePeerRef = React.useRef(deletePeers);
  const deleteMeRef = React.useRef(deleteMe);

  const joiningBackRoom = React.useCallback(
    async (join: boolean) => {
      const refreshInfo = getLocalStorage("tabs");
      if (refreshInfo == undefined) return;
      const prevRoomId = refreshInfo.roomId;
      await leaveRoom(prevRoomId, join);
      if (join) {
        setTimeout(() => {
          joinRoom(prevRoomId);
        }, 1500);
      }
    },
    [joinRoom, leaveRoom]
  );

  React.useEffect(() => {
    const connection = async () => {
      if (roomId == null) return;
      if (unsubscribeRef.current != null) {
        unsubscribeRef.current();
      }
      const unsubscribe = onSnapshot(db.room(roomId).ref(), (snapshot) => {
        const data = snapshot.data();
        if (data == undefined) return;

        const usernames = data.usernames;
        if (!usernames.includes(username)) return;
        const removedPeers = Object.keys(pcs.current).filter(
          (username) => !usernames.includes(username)
        );
        const addedPeers = usernames
          .slice(data.usernames.indexOf(username) + 1)
          .filter((username) => !pcs.current[username]);

        deletePeerRef.current(removedPeers);

        addedPeers.forEach((peer) => {
          createOffer(roomId, peer);
        });
      });

      unsubscribeRef.current = unsubscribe;
    };

    if (roomId != null) {
      connection();
      console.log("unsubscribed");
      return () => {
        if (unsubscribeRef.current != null) {
          unsubscribeRef.current();
        }
      };
    }
  }, [roomId, username, createOffer]);

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
    if (navigationEntry === "reload" && refreshInfo && refreshInfo.roomId) {
      joiningBackRoom(true);
    }
  }, [joiningBackRoom, navigationEntry]);

  React.useEffect(() => {
    receiveHeartBeatRef.current = receiveHeartBeat;
  }, [receiveHeartBeat]);

  React.useEffect(() => {
    deletePeerRef.current = deletePeers;
  }, [deletePeers]);

  useOnMount(() => {
    const sendInterval = setInterval(
      sendHeartBeatRef.current,
      HEARTBEAT_INTERVAL
    );

    const checkAliveInterval = setInterval(() => {
      const timeOutPeers: string[] = [];
      for (const peer of Object.keys(pcs.current)) {
        if (getUnixTs() - pcs.current[peer].lastSeen > TIMEOUT) {
          console.log("Peer is dead", pcs.current[peer].lastSeen);
          timeOutPeers.push(peer);
        }
      }
      deletePeerRef.current(timeOutPeers);
    }, CHECK_ALIVE_INTERVAL);
    return () => {
      clearInterval(checkAliveInterval);
      clearInterval(sendInterval);
    };
  });

  useOnMount(() => {
    // TODO(nickbar01234) - This is probably not rigorous enough
    const observer = new MutationObserver(() =>
      sendTestsRef.current({ payload: undefined })
    );
    waitForElement(CODE_MIRROR_CONTENT, 1000).then((testEditor) => {
      observer.observe(testEditor, {
        attributes: true, // Trigger code when user inputs via prettified test case console
        childList: true,
        subtree: true,
      });
    });
    return observer.disconnect;
  });

  useOnMount(() => {
    sendServiceRequest({ action: "setupLeetCodeModel" });

    const onWindowMessage = (message: MessageEvent) => {
      // todo(nickbar01234): Should attach an ID to message so that it's identifiable only by us.
      if (message.data.action != undefined) {
        const windowMessage = message.data as WindowMessage;
        console.log("Received from window", windowMessage.action);
        switch (windowMessage.action) {
          case "leetCodeOnChange": {
            sendCodeRef.current({ payload: windowMessage.changes });
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
      }}
    >
      {props.children}
    </RTCContext.Provider>
  );
};
