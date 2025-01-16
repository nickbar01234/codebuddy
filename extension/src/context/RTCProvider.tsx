import db from "@cb/db";
import { useAppState, useOnMount } from "@cb/hooks";
import {
  clearLocalStorage,
  getLocalStorage,
  sendServiceRequest,
  setLocalStorage,
} from "@cb/services";
import {
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
  Unsubscribe,
  arrayRemove,
  arrayUnion,
  deleteDoc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
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
const HEARTBEAT_INTERVAL = 10000;
const CHECK_ALIVE_INTERVAL = 20000;
const INITIAL_TIME_OUT = 30000;

export interface RTCContext {
  createRoom: (questionId: string) => void;
  joinRoom: (roomId: string, questionId: string) => Promise<boolean>;
  leaveRoom: (roomId: string) => void;
  roomId: string | null;
  setRoomId: (id: string) => void;
  informations: Record<string, PeerInformation>;
  sendMessages: (value: PeerMessage) => void;
  peerState: Record<string, PeerState>;
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
  timeOut: number;
}

export const MAX_CAPACITY = 4;

export const RTCProvider = (props: RTCProviderProps) => {
  const {
    user: { username },
  } = useAppState();
  const pcs = React.useRef<Record<string, Connection>>({});
  const unsubscribeRef = React.useRef<null | Unsubscribe>(null);
  const [roomId, setRoomId] = React.useState<null | string>(null);
  const [informations, setInformations] = React.useState<
    Record<string, PeerInformation>
  >({});
  const [connected, setConnected] = React.useState<string[]>([]);
  const [peerState, setPeerState] = React.useState<Record<string, PeerState>>(
    {}
  );

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

  const sendMessage = React.useCallback(
    (peer: string) => (payload: PeerMessage) => {
      if (
        pcs.current[peer].channel !== undefined &&
        connected.includes(peer) &&
        pcs.current[peer].channel.readyState === "open"
      ) {
        // console.log("Sending message to " + peer, payload);
        pcs.current[peer].channel.send(JSON.stringify(payload));
        return true;
      } else {
        if (!Object.keys(pcs.current).includes(peer)) {
          console.log("Not connected to " + peer);
        } else console.log("Data Channel not created yet");
        return false;
      }
    },
    [connected]
  );

  const sendMessages = React.useCallback(
    (payload: PeerMessage) => {
      for (const peer of Object.keys(pcs.current)) {
        sendMessage(peer)(payload);
      }
    },
    [sendMessage]
  );

  const sendHeartBeat = React.useCallback(
    (peer: string) => {
      return sendMessage(peer)({
        action: "heartbeat",
        timestamp: getUnixTs(),
      });
    },
    [sendMessage]
  );

  const sendCode = React.useCallback(
    async (changes?: LeetCodeContentChange) => {
      sendMessages({
        action: "code",
        code: await sendServiceRequest({ action: "getValue" }),
        changes: JSON.stringify(changes ?? {}),
        timestamp: getUnixTs(),
      });
    },
    [sendMessages]
  );

  const sendTests = React.useCallback(async () => {
    const node = document.querySelector(CODE_MIRROR_CONTENT) as HTMLDivElement;
    if (node != null) {
      sendMessages({
        action: "tests",
        tests: node.innerText.split("\n"),
        timestamp: getUnixTs(),
      });
    }
  }, [sendMessages]);

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

  const onOpen = (peer: string) => () => {
    console.log("Data Channel is open for " + peer);
    pcs.current[peer].lastSeen = getUnixTs();
    setPeerState((prev) => ({
      ...prev,
      [peer]: {
        latency: 0,
        deviation: 0,
        connected: true,
      },
    }));
  };

  const onmessage = React.useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (peer: string) =>
      function (event: MessageEvent) {
        const payload: PeerMessage = JSON.parse(event.data ?? {});
        // console.log("Message from " + username, payload);
        const { action, timestamp } = payload;
        if (Object.keys(pcs.current).includes(peer)) {
          pcs.current[peer].lastSeen = timestamp;
        }

        switch (action) {
          case "code": {
            // console.log("Received code from " + username);
            receiveCode(payload, peer);
            break;
          }

          case "tests": {
            // console.log("Received tests from " + username);
            receiveTests(payload, peer);
            break;
          }

          case "heartbeat": {
            console.log("Received heartbeat from " + peer);
            receiveHeartBeatRef.current(peer);
            break;
          }

          default:
            console.error("Unknown payload", payload);
            break;
        }
      },
    [receiveCode, receiveTests]
  );

  const createRoom = async (questionId: string) => {
    const roomRef = db.rooms().ref();
    await setDoc(
      roomRef,
      { questionId, usernames: arrayUnion(username) },
      { merge: true }
    );
    console.log("Created room");
    setRoomId(roomRef.id);
    setLocalStorage("curRoomId", {
      roomId: roomRef.id,
      numberOfUsers: 0,
    });
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
        timeOut: INITIAL_TIME_OUT,
      };

      channel.onmessage = onmessage(peer);
      channel.onopen = onOpen(peer);

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
    async (roomId: string, questionId: string): Promise<boolean> => {
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
              timeOut: INITIAL_TIME_OUT,
            };
            pc.ondatachannel = (event) => {
              pcs.current[peer].channel = event.channel;
              pcs.current[peer].channel.onmessage = onmessage(peer);
              pcs.current[peer].channel.onopen = onOpen(peer);
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

      if (getLocalStorage("curRoomId")?.roomId !== roomId.toString()) {
        toast.success(
          `You have successfully joined the room with ID ${roomId}.`
        );
      }
      return true;
    },
    [username, onmessage]
  );

  const leaveRoom = React.useCallback(
    async (roomId: string, reload = false) => {
      console.log("Leaving room", roomId);
      if (roomId == null) {
        return;
      }
      if (!reload) {
        console.log("Cleaning up local storage");
        console.log("Cleaning up local storage");
        clearLocalStorage();
      }

      await updateDoc(db.room(roomId).ref(), {
        usernames: arrayRemove(username),
      });

      const myAnswers = await getDocs(db.connections(roomId, username).ref());
      myAnswers.docs.forEach(async (doc) => {
        deleteDoc(doc.ref);
      });
      setRoomId(null);
      setInformations({});
      setPeerState({});
      pcs.current = {};
    },
    [username]
  );

  const deletePeer = React.useCallback(
    async (peer: string) => {
      if (roomId == null) return;
      if (peer == undefined) return;
      await updateDoc(db.room(roomId).ref(), {
        usernames: arrayRemove(peer),
      });
      await deleteDoc(db.connections(roomId, username).doc(peer));
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [peer]: _, ...rest } = pcs.current;
      pcs.current = rest;
      setInformations((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [peer]: _, ...rest } = prev;
        return rest;
      });
      setPeerState((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [peer]: _, ...rest } = prev;
        return rest;
      });
      console.log("Removed peer", peer);
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

  const sendCodeRef = React.useRef(sendCode);
  const sendTestsRef = React.useRef(sendTests);
  const sendHeartBeatRef = React.useRef(sendHeartBeat);
  const receiveHeartBeatRef = React.useRef(receiveHeartBeat);
  const deletePeerRef = React.useRef(deletePeer);
  const deleteMeRef = React.useRef(deleteMe);

  React.useEffect(() => {
    setConnected((prev) => {
      const newConnected = Object.keys(peerState).sort();
      const oldConnected = prev.slice().sort();
      if (JSON.stringify(newConnected) !== JSON.stringify(oldConnected)) {
        return newConnected;
      }
      return prev;
    });
  }, [peerState]);

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

        console.log("usernames", usernames);
        console.log("Added peers", addedPeers);
        console.log("Removed peers", removedPeers);

        removedPeers.forEach(deletePeer);

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
  }, [roomId, username, createOffer, deletePeer]);

  React.useEffect(() => {
    deleteMeRef.current = deleteMe;
  }, [deleteMe]);

  useOnMount(() => {
    window.addEventListener("beforeunload", deleteMeRef.current);
    return () => {
      window.removeEventListener("beforeunload", deleteMeRef.current);
    };
  });

  useOnMount(() => {
    const refreshInfo = getLocalStorage("curRoomId");
    console.log("Refresh Info", refreshInfo);
    if (refreshInfo?.roomId != undefined) {
      const prevRoomId = refreshInfo.roomId;
      const reloadJob = async () => {
        await leaveRoom(prevRoomId, true);
        await joinRoom(prevRoomId, getQuestionIdFromUrl(window.location.href));
      };
      reloadJob();
      console.log("Reloading", refreshInfo);
    }
  });

  React.useEffect(() => {
    if (roomId != null && informations) {
      setLocalStorage("curRoomId", {
        roomId,
        numberOfUsers: Object.keys(informations).length,
      });
    }
  }, [roomId, informations]);

  React.useEffect(() => {
    sendHeartBeatRef.current = sendHeartBeat;
  }, [sendHeartBeat]);

  React.useEffect(() => {
    receiveHeartBeatRef.current = receiveHeartBeat;
  }, [receiveHeartBeat]);

  React.useEffect(() => {
    deletePeerRef.current = deletePeer;
  }, [deletePeer]);

  useOnMount(() => {
    const sendInterval = setInterval(() => {
      for (const peer of Object.keys(pcs.current)) {
        sendHeartBeatRef.current(peer);
      }
    }, HEARTBEAT_INTERVAL);

    const checkAliveInterval = setInterval(() => {
      for (const peer of Object.keys(pcs.current)) {
        if (
          pcs.current[peer] &&
          pcs.current[peer].lastSeen &&
          getUnixTs() - pcs.current[peer].lastSeen > pcs.current[peer].timeOut
        ) {
          console.log("Peer is dead", pcs.current[peer].lastSeen);
          console.log("Time out", pcs.current[peer].timeOut);
          deletePeerRef.current(peer);
        }
      }
    }, CHECK_ALIVE_INTERVAL);
    return () => {
      clearInterval(checkAliveInterval);
      clearInterval(sendInterval);
    };
  });

  React.useEffect(() => {
    sendCode();
    sendCodeRef.current = sendCode;
  }, [sendCode]);

  React.useEffect(() => {
    sendTests();
    sendTestsRef.current = sendTests;
  }, [sendTests]);

  useOnMount(() => {
    // TODO(nickbar01234) - This is probably not rigorous enough
    const observer = new MutationObserver(() => sendTestsRef.current());
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
            sendCodeRef.current(message.data.changes);
            break;
          }

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
        sendMessages,
        peerState,
      }}
    >
      {props.children}
    </RTCContext.Provider>
  );
};
