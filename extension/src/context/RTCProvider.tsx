import { initializeApp } from "firebase/app";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  setDoc,
  updateDoc,
  writeBatch,
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
  createOffer: () => Promise<void>;
  answerOffer: () => Promise<void>;
  closeCall: () => Promise<void>;
  sendMessage: (message: string) => void;
}

interface RTCProviderProps {
  children: React.ReactNode;
}

export const RTCContext = React.createContext({} as RTCContext);

interface Connection {
  username: string;
  pc: RTCPeerConnection;
  message: string;
  channel: RTCDataChannel;
}

const RTCProvider = (props: RTCProviderProps) => {
  const { username } = React.useContext(userContext);
  const pcs = React.useRef<Record<string, Connection>>({});
  const [roomId, setRoomId] = React.useState<null | string>(null);

  const createRoom = async () => {
    const roomRef = doc(collection(firestore, "rooms"));
    setRoomId(roomRef.id);
    const usersRef = collection(roomRef, "users");
    await addDoc(usersRef, { username });
  };

  const joinRoom = async (roomId: string) => {
    const roomRef = doc(firestore, "rooms", roomId);
    const usersRef = collection(roomRef, "users");
    await addDoc(usersRef, { username });
    setRoomId(roomId);
  };

  React.useEffect(() => {
    if (roomId != null) {
      const roomRef = doc(firestore, "rooms", roomId);
      const usersRef = collection(roomRef, "users");
      return onSnapshot(usersRef, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === "added") {
            console.log("User joined room");
            const data = change.doc.data();
            console.log(data);
          }
        });
      });
    }
  }, [roomId]);

  //   const roomRef = doc(firestore, "rooms", roomId);
  //   const roomDoc = await getDoc(roomRef);
  //   const roomData = roomDoc.data();
  //   if (!roomData) {
  //     console.log("Room not found");
  //     return;
  //   }
  //   const users = roomData.users;
  //   if (users.includes(username)) {
  //     console.log("User already in room");
  //     return;
  //   }
  //   users.push(username);
  //   updateDoc(roomRef, { users });

  // };

  const leaveRoom = () => {};
};

// const RTCProvider = ({ children }: { children: ReactNode }) => {
//   const pcs = useRef<Record<string, Connection>>({});

//   const pc = useRef<RTCPeerConnection | null>(null);
//   const dataChannel = useRef<RTCDataChannel>();

//   const onerror = function (error: Event) {
//     console.log("Error:", error);
//   };

//   const onmessage = function (event: MessageEvent) {
//     setMessageGot(event.data);
//   };

//   const onopen = function () {
//     console.log("data channel is open and ready to be used.");
//     setConnected(true);
//   };

//   const onclose = function () {
//     console.log("data channel is closed.");
//   };

//   const sendMessage = (message: string) => {
//     if (dataChannel.current !== undefined) {
//       dataChannel.current.send(message);
//     } else {
//       console.log("Data Channel not created yet");
//     }
//   };

//   const [messageGot, setMessageGot] = useState<string>("");
//   const [callInput, setCallInput] = useState<string>("");
//   const [connected, setConnected] = useState<boolean>(false);

//   const createOffer = async () => {
//     pc.current = new RTCPeerConnection(servers);

//     const callDoc = doc(collection(firestore, "calls"));
//     await deleteSubcollection(callDoc.path, "offerCandidates");
//     const offerCandidates = collection(callDoc, "offerCandidates");
//     const answerCandidates = collection(callDoc, "answerCandidates");
//     setCallInput(callDoc.id);

//     dataChannel.current = pc.current.createDataChannel("channel");
//     dataChannel.current.onerror = onerror;
//     dataChannel.current.onmessage = onmessage;
//     dataChannel.current.onopen = onopen;
//     dataChannel.current.onclose = onclose;

//     // Get candidates for caller, save to db
//     pc.current.onicecandidate = async (event) => {
//       event.candidate &&
//         (await addDoc(offerCandidates, event.candidate.toJSON()));
//     };

//     // Create offer
//     const offerDescription = await pc.current.createOffer();
//     await pc.current.setLocalDescription(offerDescription);

//     const offer = {
//       sdp: offerDescription.sdp,
//       type: offerDescription.type,
//     };

//     await setDoc(callDoc, { offer });

//     // Listen for remote answer
//     onSnapshot(callDoc, (snapshot) => {
//       console.log("Answer added");
//       const data = snapshot.data();
//       if (pc.current && data?.answer) {
//         const answerDescription = new RTCSessionDescription(data.answer);
//         pc.current.setRemoteDescription(answerDescription);
//       }
//     });

//     // When answered, add candidate to peer connection
//     onSnapshot(answerCandidates, (snapshot) => {
//       snapshot.docChanges().forEach((change) => {
//         if (change.type === "added" && pc.current) {
//           consRt candidate = new TCIceCandidate(change.doc.data());
//           pc.current.addIceCandidate(candidate);
//         }
//       });
//     });
//   };
//   const answerOffer = async () => {
//     pc.current = new RTCPeerConnection(servers);
//     const callId = callInput;
//     const callDoc = doc(firestore, "calls", callId);

//     await deleteSubcollection(callDoc.path, "answerCandidates");

//     const answerCandidates = collection(callDoc, "answerCandidates");
//     const offerCandidates = collection(callDoc, "offerCandidates");
//     pc.current.ondatachannel = function (event) {
//       dataChannel.current = event.channel;
//       dataChannel.current.onerror = onerror;
//       dataChannel.current.onmessage = onmessage;
//       dataChannel.current.onopen = onopen;
//       dataChannel.current.onclose = onclose;
//     };

//     pc.current.onicecandidate = async (event) => {
//       event.candidate &&
//         (await addDoc(answerCandidates, event.candidate.toJSON()));
//     };

//     const callData = (await getDoc(callDoc)).data();
//     if (!callData) {
//       return;
//     }
//     const offerDescription = callData.offer;

//     await pc.current.setRemoteDescription(
//       new RTCSessionDescription(offerDescription)
//     );

//     const answerDescription = await pc.current.createAnswer();
//     await pc.current.setLocalDescription(answerDescription);

//     const answer = {
//       type: answerDescription.type,
//       sdp: answerDescription.sdp,
//     };

//     await updateDoc(callDoc, { answer });

//     onSnapshot(offerCandidates, (snapshot) => {
//       snapshot.docChanges().forEach((change) => {
//         if (change.type === "added" && pc.current) {
//           const data = change.doc.data();
//           pc.current.addIceCandidate(new RTCIceCandidate(data));
//         }
//       });
//     });
//   };

//   const closeCall = async () => {
//     if (pc.current) {
//       pc.current.close();
//       dataChannel.current?.close();
//       pc.current = null;
//     }
//   };

//   return (
//     <RTCContext.Provider
//       value={{
//         connected,
//         callInput,
//         setCallInput,
//         createOffer,
//         answerOffer,
//         closeCall,
//         messageGot,
//         sendMessage,
//       }}
//     >
//       {children}
//     </RTCContext.Provider>
//   );
// };

// export default RTCProvider;

// async function deleteSubcollection(
//   parentDocPath: string,
//   subcollectionName: string
// ) {
//   const subCollection = collection(
//     firestore,
//     `${parentDocPath}/${subcollectionName}`
//   );
//   const snapshot = await getDocs(subCollection);
//   const batch = writeBatch(firestore);
//   snapshot.docs.forEach((doc) => {
//     batch.delete(doc.ref);
//   });

//   await batch.commit();
// }

// const webCamOnClick = async () => {
//   const localStream = await navigator.mediaDevices.getUserMedia({
//     video: true,
//     audio: true,
//   });
//   const remoteStream = new MediaStream();
//   pc.current.ontrack = (event) => {
//     console.log("adding track for remote");
//     console.dir(remoteStream);
//     event.streams[0].getTracks().forEach((track) => {
//       remoteStream.addTrack(track);
//     });
//     setRemoteStream(remoteStream.clone());
//   };

//   // Push tracks from local stream to peer connection
//   localStream.getTracks().forEach((track) => {
//     console.log("adding track for local");
//     pc.current.addTrack(track, localStream);
//   });
//   setLocalStream(localStream);
//   setRemoteStream(remoteStream);
// };
