import {
  Unsubscribe,
  arrayUnion,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import React from "react";
import db from "@cb/db";
import { useState } from "@cb/hooks";
import { toast } from "sonner";
import { constructUrlFromQuestionId } from "@cb/utils/url";

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

interface RTCContext {
  createRoom: (questionId: string) => void;
  joinRoom: (roomId: string, questionId: string) => Promise<boolean>;
  leaveRoom: () => void;
  roomId: string | null;
  setRoomId: (id: string) => void;
  informations: Record<string, string>;
  sendMessages: (value: string) => void;
  connected: boolean;
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

const RTCProvider = (props: RTCProviderProps) => {
  const {
    user: { username },
  } = useState();

  const pcs = React.useRef<Record<string, Connection>>({});
  const [roomId, setRoomId] = React.useState<null | string>(null);
  const [informations, setInformations] = React.useState<
    Record<string, string>
  >({});
  const unsubscribeRef = React.useRef<null | Unsubscribe>(null);
  const [connected, setConnected] = React.useState<boolean>(false);

  const sendMessages = (value: string) => {
    for (const username of Object.keys(pcs.current)) {
      sendMessage(username)(value);
    }
  };

  const onmessage = (username: string) =>
    function (event: MessageEvent) {
      console.log("Message from " + username);
      setInformations((prev) => ({
        ...prev,
        [username]: event.data,
      }));
    };

  const sendMessage = (username: string) => (message: string) => {
    if (pcs.current[username].channel !== undefined) {
      console.log("Sending message to " + username);
      pcs.current[username].channel.send(message);
    } else {
      console.log("Data Channel not created yet");
    }
  };

  const createRoom = async (questionId: string) => {
    const roomRef = db.rooms().ref();
    await setDoc(
      roomRef,
      { usernames: [username], questionId },
      {
        merge: true,
      }
    );
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

      pc.addEventListener("connectionstatechange", () => {
        setConnected(pc.iceConnectionState === "connected");
      });
    },
    [username]
  );

  const joinRoom = async (
    roomId: string,
    questionId: string
  ): Promise<boolean> => {
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

    setRoomId(roomId);

    await updateDoc(db.rooms().doc(roomId).ref(), {
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
          };
          pc.ondatachannel = (event) => {
            pcs.current[peer].channel = event.channel;
            pcs.current[peer].channel.onmessage = onmessage(peer);
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
          await pc.setRemoteDescription(new RTCSessionDescription(data.offer));

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await updateDoc(themRef, { answer: answer });
        }

        data.offerCandidates.forEach((candidate: RTCIceCandidateInit) => {
          pc.addIceCandidate(new RTCIceCandidate(candidate));
        });

        pc.addEventListener("connectionstatechange", () => {
          setConnected(pc.iceConnectionState === "connected");
        });
      });
    });

    toast.success(`You have successfully joined the room with ID ${roomId}.`);
    return true;
  };

  React.useEffect(() => {
    const connection = async () => {
      if (roomId == null) return;

      const roomRef = db.rooms().doc(roomId);
      const usernames = (await roomRef.doc()).data()?.usernames ?? [];
      const unsubscribe = onSnapshot(roomRef.ref(), (doc) => {
        const maybeData = doc.data();
        if (maybeData == undefined) return;
        maybeData.usernames
          .filter(
            (user) =>
              user !== username &&
              !usernames.includes(user) &&
              pcs.current[user] == undefined
          )
          .forEach(async (user: string) => {
            await createOffer(roomId, user);
          });
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

  const leaveRoom = () => {};

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
export default RTCProvider;
