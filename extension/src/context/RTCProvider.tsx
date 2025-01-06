import db from "@cb/db";
import { useOnMount, useAppState } from "@cb/hooks";
import {
  constructUrlFromQuestionId,
  getQuestionIdFromUrl,
  waitForElement,
} from "@cb/utils";
import {
  Unsubscribe,
  arrayUnion,
  deleteDoc,
  getDocs,
  onSnapshot,
  setDoc,
  arrayRemove,
  updateDoc,
} from "firebase/firestore";
import React from "react";
import { toast } from "sonner";
import { sendServiceRequest } from "@cb/services";
import {
  Payload,
  PeerCodeMessage,
  PeerMessage,
  PeerTestMessage,
} from "@cb/types";
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

export interface PeerInformation {
  code?: Payload<PeerCodeMessage>;
  tests?: Payload<PeerTestMessage>;
}

export interface RTCContext {
  createRoom: (questionId: string) => void;
  joinRoom: (roomId: string, questionId: string) => Promise<boolean>;
  leaveRoom: (roomId: string) => void;
  roomId: string | null;
  setRoomId: (id: string) => void;
  informations: Record<string, PeerInformation>;
  sendMessages: (value: PeerMessage) => void;
  connected: Record<string, boolean>;
}

interface RTCProviderProps {
  children: React.ReactNode;
}

export const RTCContext = React.createContext({} as RTCContext);

interface Connection {
  username: string;
  pc: RTCPeerConnection;
  channel: RTCDataChannel;
}

export const MAX_CAPACITY = 4;

export const RTCProvider = (props: RTCProviderProps) => {
  const {
    user: { username },
  } = useAppState();

  const pcs = React.useRef<Record<string, Connection>>({});
  const [roomId, setRoomId] = React.useState<null | string>(null);
  const [informations, setInformations] = React.useState<
    Record<string, PeerInformation>
  >({});
  const unsubscribeRef = React.useRef<null | Unsubscribe>(null);
  const [connected, setConnected] = React.useState<Record<string, boolean>>({});

  const sendMessage = React.useCallback(
    (username: string) => (payload: PeerMessage) => {
      if (pcs.current[username].channel !== undefined) {
        console.log("Sending message to " + username);
        pcs.current[username].channel.send(JSON.stringify(payload));
      } else {
        if (connected[username] == undefined) {
          console.log("Not connected to " + username);
        } else console.log("Data Channel not created yet");
      }
    },
    [connected]
  );

  const sendMessages = React.useCallback(
    (payload: PeerMessage) => {
      for (const username of Object.keys(pcs.current)) {
        sendMessage(username)(payload);
      }
    },
    [sendMessage]
  );

  const sendCode = React.useCallback(async () => {
    sendMessages({
      action: "code",
      code: await sendServiceRequest({ action: "getValue" }),
      changes: document.querySelector("#trackEditor")?.textContent ?? "{}",
    });
  }, [sendMessages]);

  const sendTests = React.useCallback(async () => {
    const node = document.querySelector(CODE_MIRROR_CONTENT) as HTMLDivElement;
    if (node != null) {
      sendMessages({ action: "tests", tests: node.innerText.split("\n") });
    }
  }, [sendMessages]);

  const sendCodeRef = React.useRef(sendCode);
  const sendTestsRef = React.useRef(sendTests);

  const onOpen = (username: string) => () => {
    console.log("Data Channel is open for " + username);
    // console.log("hello");
    console.dir(pcs.current[username].pc);
    setConnected((prev) => ({
      ...prev,
      [username]: true,
    }));
  };

  const onmessage = (username: string) =>
    function (event: MessageEvent) {
      const payload: PeerMessage = JSON.parse(event.data ?? {});
      console.log("Message from " + username, payload);
      const { action } = payload;
      switch (action) {
        case "code": {
          const { action: _, ...rest } = payload;
          setInformations((prev) => ({
            ...prev,
            [username]: {
              ...prev[username],
              code: rest,
            },
          }));
          break;
        }

        case "tests": {
          const { action: _, ...rest } = payload;
          setInformations((prev) => ({
            ...prev,
            [username]: {
              ...prev[username],
              tests: rest,
            },
          }));
          break;
        }

        default:
          console.error("Unknown payload", payload);
          break;
      }
    };

  const createRoom = async (questionId: string) => {
    const roomRef = db.rooms().ref();
    await setDoc(
      roomRef,
      { questionId, usernames: arrayUnion(username) },
      { merge: true }
    );
    // await db.usernamesCollection(roomRef.id).addUser(username);
    console.log("Created room");
    setRoomId(roomRef.id);
    localStorage.setItem(
      "curRoomId",
      JSON.stringify({
        roomId: roomRef.id,
        numberOfUsers: 0,
      })
    );
  };

  const createOffer = React.useCallback(
    async (roomId: string, peer: string) => {
      const meRef = db.connections(roomId, peer).doc(username);

      const pc = new RTCPeerConnection(servers);

      const channel = pc.createDataChannel("channel");
      pcs.current[peer] = {
        username: peer,
        pc: pc,
        channel: channel,
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
    [username]
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
      // const usernamesCollection = await db.usernamesCollection(roomId).doc();

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
      // await db.usernamesCollection(roomId).addUser(username);

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
          // const pc = new RTCPeerConnection(servers);
          if (pcs.current[peer] == undefined) {
            pcs.current[peer] = {
              username: peer,
              pc: pc,
              channel: pc.createDataChannel("channel"),
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

      if (
        JSON.parse(localStorage.getItem("curRoomId") ?? "{}").roomId !==
        roomId.toString()
      ) {
        toast.success(
          `You have successfully joined the room with ID ${roomId}.`
        );
      }
      localStorage.setItem(
        "curRoomId",
        JSON.stringify({
          roomId: roomId,
          numberOfUsers: usernames.length,
          // numberOfUsers: usernamesCollection.size,
        })
      );
      return true;
    },
    [username]
  );

  const leaveRoom = React.useCallback(
    async (roomId: string, reload = false) => {
      console.log("Leaving room", roomId);
      if (roomId == null) {
        return;
      }
      if (!reload) {
        console.log("Cleaning up local storage");
        localStorage.removeItem("reloading");
        localStorage.removeItem("curRoomId");
        localStorage.removeItem("tabs");
        localStorage.clear();
      }

      await updateDoc(db.room(roomId).ref(), {
        usernames: arrayRemove(username),
      });
      // await db.usernamesCollection(roomId).deleteUser(username);
      const myAnswers = await getDocs(db.connections(roomId, username).ref());
      myAnswers.docs.forEach(async (doc) => {
        deleteDoc(doc.ref);
      });
      setRoomId(null);
      setInformations({});
      setConnected({});
      pcs.current = {};
      if (!reload) {
        sendServiceRequest({
          action: "cleanEditor",
        });
      }
    },
    [username]
  );

  React.useEffect(() => {
    const handleBeforeUnload = async () => {
      if (roomId) {
        console.log("Before Reloading", roomId);
        await updateDoc(db.room(roomId).ref(), {
          usernames: arrayRemove(username),
        });
        // await db.usernamesCollection(roomId).deleteUser(username);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [roomId, username]);

  React.useEffect(() => {
    const refreshInfo = JSON.parse(localStorage.getItem("curRoomId") ?? "{}");
    if (refreshInfo && refreshInfo.roomId) {
      console.log("Reloading", refreshInfo);
      const prevRoomId = refreshInfo.roomId;
      const reloadJob = async () => {
        await leaveRoom(prevRoomId, true);
        await joinRoom(prevRoomId, getQuestionIdFromUrl(window.location.href));
      };
      reloadJob();
    }
  }, [joinRoom, leaveRoom]);

  React.useEffect(() => {
    const connection = async () => {
      if (roomId == null) return;

      const unsubscribe = onSnapshot(db.room(roomId).ref(), (snapshot) => {
        const data = snapshot.data();
        if (data == undefined) return;
        const usernames = data.usernames.slice(
          data.usernames.indexOf(username) + 1
        );

        const addedPeers = usernames.filter(
          (username) => !pcs.current[username]
        );
        const removedPeers = Object.keys(pcs.current).filter(
          (username) => !usernames.includes(username)
        );
        addedPeers.forEach(async (peer) => {
          console.log("Added peer");
          if (peer == undefined || peer === username) {
            return;
          }
          console.log("Create Offer to", peer);
          await createOffer(roomId, peer);
        });
        removedPeers.forEach(async (peer) => {
          if (peer == undefined) return;
          if (pcs.current[peer] == undefined) return;
          const { [peer]: _, ...rest } = pcs.current;
          pcs.current = rest;
          console.log("Removed peer", peer);
          await deleteDoc(db.connections(roomId, username).doc(peer));
          setInformations((prev) => {
            const { [peer]: _, ...rest } = prev;
            return rest;
          });
          setConnected((prev) => {
            const { [peer]: _, ...rest } = prev;
            return rest;
          });
        });
        localStorage.setItem(
          "curRoomId",
          JSON.stringify({
            roomId: roomId,
            numberOfUsers: usernames.length,
          })
        );
      });

      unsubscribeRef.current = unsubscribe;
    };

    if (roomId != null) {
      connection();
      return () => {
        if (unsubscribeRef.current != null) {
          unsubscribeRef.current();
        }
      };
    }
  }, [roomId, username, createOffer]);

  React.useEffect(() => {
    sendCode();
    sendCodeRef.current = sendCode;
  }, [sendCode]);

  useOnMount(() => {
    const observer = new MutationObserver(async () => {
      await sendCodeRef.current();
    });
    waitForElement("#trackEditor", 2000).then((editor) => {
      observer.observe(editor, {
        childList: true,
        subtree: true,
      });
    });
    return observer.disconnect;
  });

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
        connected,
      }}
    >
      {props.children}
    </RTCContext.Provider>
  );
};
