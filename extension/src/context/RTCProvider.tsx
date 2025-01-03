import db from "@cb/db";
import { useOnMount, useState } from "@cb/hooks";
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
  updateDoc,
} from "firebase/firestore";
import React from "react";
import { toast } from "sonner";
import { sendServiceRequest } from "@cb/services";
import { PeerCodeMessage, PeerMessage } from "@cb/types";

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

interface PeerInformation {
  code: Omit<PeerCodeMessage, "action">;
}

export interface RTCContext {
  createRoom: (questionId: string) => void;
  joinRoom: (roomId: string, questionId: string) => Promise<boolean>;
  leaveRoom: (roomId: string) => void;
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

const MAX_CAPACITY = 4;

export const RTCProvider = (props: RTCProviderProps) => {
  const {
    user: { username },
  } = useState();

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

  const sendCodeRef = React.useRef(sendCode);

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
      console.log("Message from " + username);
      const payload: PeerMessage = JSON.parse(event.data ?? {});
      const { action, ...rest } = payload;
      switch (action) {
        case "code":
          setInformations((prev) => ({
            ...prev,
            [username]: {
              ...prev[username],
              code: rest,
            },
          }));
          break;
        default:
          console.error("Unknown payload", payload);
      }
    };

  const createRoom = async (questionId: string) => {
    const roomRef = db.rooms().ref();
    await setDoc(roomRef, { questionId }, { merge: true });
    await db.usernamesCollection(roomRef.id).addUser(username);
    console.log("Created room");
    setRoomId(roomRef.id);
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
      if (!roomId) {
        toast.error("Please enter room ID");
        return false;
      }
  const joinRoom = React.useCallback(
    async (roomId: string, questionId: string): Promise<boolean> => {
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

      const usernamesCollection = await db.usernamesCollection(roomId).doc();
      if (usernamesCollection.size >= MAX_CAPACITY) {
        console.log("The room is at max capacity");
        toast.error("This room is already at max capacity.");
        return false;
      }
      // console.log("Joining room", roomId);
      setRoomId(roomId);
      const usernamesCollection = await db.usernamesCollection(roomId).doc();
      if (usernamesCollection.size >= MAX_CAPACITY) {
        console.log("The room is at max capacity");
        toast.error("This room is already at max capacity.");
        return false;
      }
      // console.log("Joining room", roomId);
      setRoomId(roomId);

      await db.usernamesCollection(roomId).addUser(username);
      await db.usernamesCollection(roomId).addUser(username);

      onSnapshot(db.connections(roomId, username).ref(), (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "removed") {
            return;
          }
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
          if (data.offer != undefined && pc.remoteDescription == null) {
            await pc.setRemoteDescription(
              new RTCSessionDescription(data.offer)
            );

            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await updateDoc(themRef, { answer: answer });
          }
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await updateDoc(themRef, { answer: answer });
          }

          data.offerCandidates.forEach((candidate: RTCIceCandidateInit) => {
            pc.addIceCandidate(new RTCIceCandidate(candidate));
          });
        });
      });
          data.offerCandidates.forEach((candidate: RTCIceCandidateInit) => {
            pc.addIceCandidate(new RTCIceCandidate(candidate));
          });
        });
      });

      toast.success(`You have successfully joined the room with ID ${roomId}.`);
      return true;
    },
    [username]
  );

  const leaveRoom = React.useCallback(
    async (roomId: string, reload = false) => {
      if (roomId == null) {
        return;
      }
      await db.usernamesCollection(roomId).deleteUser(username);
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
        localStorage.setItem("reloading", roomId);
        await db.usernamesCollection(roomId).deleteUser(username);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [roomId, username]);

  React.useEffect(() => {
    const reloading = localStorage.getItem("reloading");
    if (reloading) {
      console.log("Reloading", reloading);
      localStorage.removeItem("reloading");
      const reloadJob = async () => {
        await leaveRoom(reloading, true);
        await joinRoom(reloading, getQuestionIdFromUrl(window.location.href));
      };
      reloadJob();
    }
  }, [joinRoom, leaveRoom]);

  React.useEffect(() => {
    const connection = async () => {
      if (roomId == null) return;
      const unsubscribe = onSnapshot(
        db.usernamesCollection(roomId).ref(),
        (snapshot) => {
          snapshot.docChanges().forEach(async (change) => {
            if (change.type === "removed") {
              const peer = change.doc.id;
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
              return;
            }
            if (change.type === "added") {
              console.log("Added peer");
              console.log("Added peer");
              const peer = change.doc.id;
              const usernamesSnapshot = await db
                .usernamesCollection(roomId)
                .doc();
              const myTimeStamp = usernamesSnapshot.docs
                .find((doc) => doc.id === username)
                ?.data().createdAt;
              // console.log(myTimeStamp);
              const usernamesSnapshot = await db
                .usernamesCollection(roomId)
                .doc();
              const myTimeStamp = usernamesSnapshot.docs
                .find((doc) => doc.id === username)
                ?.data().createdAt;
              // console.log(myTimeStamp);
              if (peer == undefined || peer === username) {
                return;
              }
              if (myTimeStamp.seconds >= change.doc.data().createdAt.seconds) {
                return;
              }

              console.log("Create Offer to", change.doc.id);
              if (myTimeStamp.seconds >= change.doc.data().createdAt.seconds) {
                return;
              }

              console.log("Create Offer to", change.doc.id);
              await createOffer(roomId, peer);
            }
          });
        }
      );
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
    return () => {
      observer.disconnect();
    };
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
