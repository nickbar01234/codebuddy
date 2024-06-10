import { initializeApp } from "firebase/app";
import {
  DocumentData,
  DocumentReference,
  Unsubscribe,
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import React from "react";
import { userContext } from "./UserProvider";

const firebaseConfig = {
  // your config
  apiKey: "AIzaSyBDu1Q1vQVi1x6U0GfWXIFmohb32jIhKjY",
  authDomain: "codebuddy-1b0dc.firebaseapp.com",
  projectId: "codebuddy-1b0dc",
  storageBucket: "codebuddy-1b0dc.appspot.com",
  messagingSenderId: "871987263347",
  appId: "1:871987263347:web:cb21306ac3d48eb4e5b706",
  measurementId: "G-64K0SVBGFK",
};

const app = initializeApp(firebaseConfig);

const firestore = getFirestore(app);

const servers = {
  iceServers: [
    {
      urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
    },
  ],
  iceCandidatePoolSize: 10,
};

interface RTCContext {
  createRoom: () => void;
  joinRoom: (id: string) => void;
  leaveRoom: () => void;
  roomId: string | null;
  setRoomId: (id: string) => void;
  informations: Record<string, string>;
  sendMessages: (value: string) => void;
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
  const { username } = React.useContext(userContext);

  const pcs = React.useRef<Record<string, Connection>>({});
  const [roomId, setRoomId] = React.useState<null | string>(null);
  const [informations, setInformations] = React.useState<
    Record<string, string>
  >({});
  const unsubscribeRef = React.useRef<null | Unsubscribe>(null);

  const sendMessages = (value: string) => {
    for (const username of Object.keys(pcs.current)) {
      sendMessage(username)(value);
    }
  };

  const onerror = function (error: Event) {
    console.log("Error:", error);
  };

  const onmessage = (username: string) =>
    function (event: MessageEvent) {
      console.log("Message from " + username + ": " + event.data);
      setInformations((prev) => ({
        ...prev,
        [username]: event.data,
      }));
    };

  const onopen = function () {
    console.log("data channel is open and ready to be used.");
  };

  const onclose = function () {
    console.log("data channel is closed.");
  };

  const sendMessage = (username: string) => (message: string) => {
    if (pcs.current[username].channel !== undefined) {
      console.log("Sending message to " + username + ": " + message);
      pcs.current[username].channel.send(message);
    } else {
      console.log("Data Channel not created yet");
    }
  };

  const createRoom = async () => {
    const roomRef = doc(collection(firestore, "rooms"));
    setRoomId(roomRef.id);
    await setDoc(
      roomRef,
      { usernames: [username] },
      {
        merge: true,
      }
    );
  };

  const createOffer = React.useCallback(
    async (
      peer: string,
      roomRef: DocumentReference<DocumentData, DocumentData>
    ) => {
      const meRef = doc(roomRef, peer, username);

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

        if (
          maybeData?.answer != undefined &&
          pc.currentRemoteDescription == null
        ) {
          pc.setRemoteDescription(
            new RTCSessionDescription(doc.data()?.answer)
          );
        }

        const answerCandidates = maybeData?.answerCandidates ?? [];
        answerCandidates.forEach((candidate: RTCIceCandidateInit) => {
          pc.addIceCandidate(new RTCIceCandidate(candidate));
        });
      });
    },
    [username]
  );

  const joinRoom = async (roomId: string) => {
    setRoomId(roomId);

    await updateDoc(doc(firestore, "rooms", roomId), {
      usernames: arrayUnion(username),
    });

    onSnapshot(collection(firestore, "rooms", roomId, username), (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "removed") {
          return;
        }

        const data = change.doc.data();

        if (data.username == undefined) {
          return;
        }

        const themRef = doc(
          firestore,
          "rooms",
          roomId,
          username,
          data.username
        );

        if (pcs.current[data.username] == undefined) {
          const pc = new RTCPeerConnection(servers);
          pcs.current[data.username] = {
            username: data.username,
            pc: pc,
            channel: pc.createDataChannel("channel"),
          };
          pcs.current[data.username].pc.ondatachannel = (event) => {
            pcs.current[data.username].channel = event.channel;
            pcs.current[data.username].channel.onmessage = onmessage(
              data.username
            );
          };

          pcs.current[data.username].pc.onicecandidate = async (event) => {
            if (event.candidate) {
              await updateDoc(themRef, {
                answerCandidates: arrayUnion(event.candidate.toJSON()),
              });
            }
          };
        }

        if (
          data.offer &&
          pcs.current[data.username].pc.remoteDescription == null
        ) {
          await pcs.current[data.username].pc.setRemoteDescription(
            new RTCSessionDescription(data.offer)
          );

          const answer = await pcs.current[data.username].pc.createAnswer();
          await pcs.current[data.username].pc.setLocalDescription(answer);
          await updateDoc(themRef, { answer: answer });
        }

        const offerCandidates = data.offerCandidates ?? [];
        offerCandidates.forEach((candidate: RTCIceCandidateInit) => {
          pcs.current[data.username].pc.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        });
      });
    });
  };

  React.useEffect(() => {
    const connection = async () => {
      if (roomId == null) return;

      const roomRef = doc(firestore, "rooms", roomId);
      const usernames = (await getDoc(roomRef)).data()?.usernames ?? [];
      const unsubscribe = onSnapshot(roomRef, (doc) => {
        const maybeData = doc.data();
        if (maybeData == undefined) return;
        maybeData.usernames.forEach(async (user: string) => {
          if (user !== username && !usernames.includes(user))
            await createOffer(user, roomRef);
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
      }}
    >
      {props.children}
    </RTCContext.Provider>
  );
};
export default RTCProvider;
