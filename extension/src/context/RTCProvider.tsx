import { initializeApp } from "firebase/app";
import {
  DocumentData,
  DocumentReference,
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

    const usersRef = collection(roomRef, "users");
    onSnapshot(usersRef, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          if (change.doc.data().username !== username) {
            console.log("New user added" + change.doc.data().username);
            const currentPeer = change.doc.data().username;
            await createOffer(currentPeer, roomRef);
          }
        }
      });
    });
  };

  const joinRoom = async (roomId: string) => {
    if (roomId === null) {
      return;
    }
    setRoomId(roomId);
    console.log("Joining room   " + roomId);
    const roomRef = doc(firestore, "rooms", roomId);
    const previousUser = (await getDoc(roomRef))?.data()?.usernames;
    await updateDoc(roomRef, { usernames: arrayUnion(username) });
    const newUserRef = doc(roomRef, "users", username);
    await setDoc(newUserRef, { username });

    if (roomId !== null) {
      const roomRef = doc(firestore, "rooms", roomId);
      const usersRef = collection(roomRef, "users");
      onSnapshot(usersRef, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          console.log("receving something new");
          if (change.type === "added") {
            if (
              change.doc.data().username !== username &&
              !previousUser.includes(change.doc.data().username)
            ) {
              console.log("New user added" + change.doc.data().username);
              const currentPeer = change.doc.data().username;
              await createOffer(currentPeer, roomRef);
            }
          }
        });
      });
    }

    const myUserRef = doc(roomRef, "users", username);
    const myConnectionRef = collection(myUserRef, "connections");
    onSnapshot(myConnectionRef, (snapshot) => {
      snapshot.docChanges().forEach(async (change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          const currentConnectionRef = doc(
            myUserRef,
            "connections",
            data.username
          );
          const currentPeer = data.username;
          if (data.username !== username) {
            console.log("New user added to my connection" + data.username);

            const offerCandidates = collection(
              currentConnectionRef,
              "offerCandidates"
            );
            const answerCandidates = collection(
              currentConnectionRef,
              "answerCandidates"
            );
            const pc = new RTCPeerConnection(servers);
            pcs.current[currentPeer] = {
              username: currentPeer,
              pc: pc,
              channel: pc.createDataChannel("channel"),
            };
            pcs.current[currentPeer].pc.ondatachannel = function (event) {
              pcs.current[currentPeer].channel = event.channel;
              pcs.current[currentPeer].channel.onerror = onerror;
              pcs.current[currentPeer].channel.onmessage =
                onmessage(currentPeer);
              pcs.current[currentPeer].channel.onopen = onopen;
              pcs.current[currentPeer].channel.onclose = onclose;
            };

            pcs.current[currentPeer].pc.onicecandidate = async (event) => {
              event.candidate &&
                (await addDoc(answerCandidates, event.candidate.toJSON()));
            };

            const currentConnectionData = (
              await getDoc(currentConnectionRef)
            ).data();
            if (currentConnectionData) {
              const offerDescription = currentConnectionData.offer;
              await pcs.current[currentPeer].pc.setRemoteDescription(
                new RTCSessionDescription(offerDescription)
              );
            }

            const answer = await pcs.current[currentPeer].pc.createAnswer();
            await pcs.current[currentPeer].pc.setLocalDescription(answer);
            await updateDoc(currentConnectionRef, { answer });

            onSnapshot(offerCandidates, (snapshot) => {
              snapshot.docChanges().forEach((change) => {
                if (change.type === "added" && pcs.current[currentPeer].pc) {
                  const data = change.doc.data();
                  pcs.current[currentPeer].pc.addIceCandidate(
                    new RTCIceCandidate(data)
                  );
                }
              });
            });

            pc.addEventListener("connectionstatechange", (event) => {
              console.log("Connection state change");
              console.dir(event);
            });
          }
        }
      });
    });
  };

  const createOffer = async (
    currentPeer: string,
    roomRef: DocumentReference<DocumentData, DocumentData>
  ) => {
    const newUserRef = doc(roomRef, "users", currentPeer);
    const myConnectionRef = doc(newUserRef, "connections", username);
    const offerCandidates = collection(myConnectionRef, "offerCandidates");
    const answerCandidates = collection(myConnectionRef, "answerCandidates");

    const pc = new RTCPeerConnection(servers);
    pcs.current[currentPeer] = {
      username: currentPeer,
      pc: pc,
      channel: pc.createDataChannel("channel"),
    };
    pcs.current[currentPeer].channel.onmessage = onmessage(currentPeer);
    pcs.current[currentPeer].channel.onerror = onerror;
    pcs.current[currentPeer].channel.onopen = onopen;
    pcs.current[currentPeer].channel.onclose = onclose;

    pc.onicecandidate = async (event) => {
      event.candidate &&
        (await addDoc(offerCandidates, event.candidate.toJSON()));
    };

    const offerDescription = await pcs.current[currentPeer].pc.createOffer();
    await pc.setLocalDescription(offerDescription);
    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };
    await setDoc(myConnectionRef, { username, offer });

    onSnapshot(myConnectionRef, (snapshot) => {
      const data = snapshot.data();
      if (pc && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pcs.current[currentPeer].pc.setRemoteDescription(answerDescription);
      }
    });

    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" && pc) {
          const data = change.doc.data();
          console.log("Adding ice candidate for answer");
          pc.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });

    pc.addEventListener("connectionstatechange", (event) => {
      console.log("Connection state change");
      console.dir(event);
    });
  };

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
