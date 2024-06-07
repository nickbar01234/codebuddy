import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { set } from "mongoose";
import { ReactNode, createContext, useEffect, useRef, useState } from "react";

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
  callInput: string;
  setCallInput: (input: string) => void;
  webCamOnClick: () => Promise<void>;
  createOffer: () => Promise<void>;
  answerOffer: () => Promise<void>;
  localStream: MediaStream;
  remoteStream: MediaStream;
  closeCall: () => Promise<void>;
  messageGot: string;
  sendMessage: (message: string) => void;
}
export const RTCContext = createContext({} as RTCContext);

const RTCProvider = ({ children }: { children: ReactNode }) => {
  const pc = useRef(new RTCPeerConnection(servers));
  let dataChannel = pc.current.createDataChannel("myDataChannel");
  console.log(pc.current.iceConnectionState);
  console.dir(pc.current);

  dataChannel.onerror = function (error) {
    console.log("Error:", error);
  };

  dataChannel.onmessage = function (event) {
    console.log("Got message:", dataChannel);
    setMessageGot(event.data);
  };

  dataChannel.onopen = function () {
    console.dir("Open", dataChannel);
    console.log("data channel is open and ready to be used.");
  };

  dataChannel.onclose = function () {
    console.log("data channel is closed.");
  };

  pc.current.ondatachannel = function (event) {
    console.log("data channel is created");
    dataChannel = event.channel;
  };
  const sendMessage = (message: string) => {
    console.log("Using data channel");
    console.dir("Sent");
    console.dir(dataChannel);
    dataChannel.send(message);
  };

  const [localStream, setLocalStream] = useState<MediaStream>(
    new MediaStream()
  );
  const [messageGot, setMessageGot] = useState<string>("");

  const [remoteStream, setRemoteStream] = useState<MediaStream>(
    new MediaStream()
  );
  const [callInput, setCallInput] = useState<string>("");

  const webCamOnClick = async () => {
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    pc.current = new RTCPeerConnection(servers);

    const remoteStream = new MediaStream();
    pc.current.ontrack = (event) => {
      console.log("adding track for remote");
      console.dir(remoteStream);
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
      setRemoteStream(remoteStream.clone());
    };

    // Push tracks from local stream to peer connection
    localStream.getTracks().forEach((track) => {
      console.log("adding track for local");
      pc.current.addTrack(track, localStream);
    });

    setLocalStream(localStream);
    setRemoteStream(remoteStream);
  };

  const createOffer = async () => {
    const callDoc = doc(collection(firestore, "calls"));
    const offerCandidates = collection(callDoc, "offerCandidates");
    const answerCandidates = collection(callDoc, "answerCandidates");
    setCallInput(callDoc.id);

    // Get candidates for caller, save to db
    pc.current.onicecandidate = async (event) => {
      event.candidate &&
        (await addDoc(offerCandidates, event.candidate.toJSON()));
    };

    // Create offer
    const offerDescription = await pc.current.createOffer();
    await pc.current.setLocalDescription(offerDescription);

    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };

    await setDoc(callDoc, { offer });

    // Listen for remote answer
    onSnapshot(callDoc, (snapshot) => {
      console.dir(snapshot.data());
      const data = snapshot.data();
      if (!pc.current.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        pc.current.setRemoteDescription(answerDescription);
      }
    });

    // When answered, add candidate to peer connection
    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const candidate = new RTCIceCandidate(change.doc.data());
          pc.current.addIceCandidate(candidate);
        }
      });
    });
  };
  const answerOffer = async () => {
    console.log("answering Calls");
    console.dir(remoteStream);
    const callId = callInput;
    const callDoc = doc(firestore, "calls", callId);

    const answerCandidates = collection(callDoc, "answerCandidates");
    const offerCandidates = collection(callDoc, "offerCandidates");

    pc.current.onicecandidate = async (event) => {
      event.candidate &&
        (await addDoc(answerCandidates, event.candidate.toJSON()));
    };

    const callData = (await getDoc(callDoc)).data();
    if (!callData) {
      return;
    }
    const offerDescription = callData.offer;

    await pc.current.setRemoteDescription(
      new RTCSessionDescription(offerDescription)
    );

    const answerDescription = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answerDescription);

    const answer = {
      type: answerDescription.type,
      sdp: answerDescription.sdp,
    };

    await updateDoc(callDoc, { answer });

    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          pc.current.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
  };

  const closeCall = async () => {
    pc.current.getSenders().forEach((sender) => {
      if (sender.track) {
        sender.track.enabled = false;
      }
    });
  };
  return (
    <RTCContext.Provider
      value={{
        localStream: localStream,
        remoteStream: remoteStream,
        callInput,
        setCallInput,
        webCamOnClick,
        createOffer,
        answerOffer,
        closeCall,
        messageGot,
        sendMessage,
      }}
    >
      {children}
    </RTCContext.Provider>
  );
};

export default RTCProvider;
