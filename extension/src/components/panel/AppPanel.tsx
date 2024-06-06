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
import { useEffect, useRef, useState } from "react";
import { ResizableBox } from "react-resizable";
import { VerticalHandle } from "./Handle";
import EditorProvider, { Tab } from "./editor";

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

const AppPanel = () => {
  const pc = new RTCPeerConnection(servers);
  let localStream: MediaStream;
  let remoteStream: MediaStream;
  useEffect(() => {
    console.log(pc.iceConnectionState);
    console.log(pc.signalingState);
  });

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const callButtonRef = useRef<HTMLButtonElement>(null);
  const webcamButtonRef = useRef<HTMLButtonElement>(null);
  const answerButtonRef = useRef<HTMLButtonElement>(null);
  const hangupButtonRef = useRef<HTMLButtonElement>(null);
  const [callInput, setCallInput] = useState<string>("");
  useEffect(() => {
    if (
      webcamButtonRef.current &&
      callButtonRef.current &&
      answerButtonRef.current &&
      hangupButtonRef.current
    ) {
      callButtonRef.current.disabled = true;
      answerButtonRef.current.disabled = true;
      hangupButtonRef.current.disabled = true;
    }
  }, []);

  const ref = useRef<HTMLDivElement>(null);
  // const editor = useMonaco();
  // const [value, setValue] = useState<string>("");
  // useEffect(() => {
  //   console.log(value);
  // }, [value]);
  // useEffect(() => {
  //   const TIME_OUT = 2000; // ms
  //   const MONACO_ROOT_ID =
  //     "#editor > div.flex.flex-1.flex-col.overflow-hidden.pb-2 > div.flex-1.overflow-hidden > div > div > div.overflow-guard > div.monaco-scrollable-element.editor-scrollable.vs-dark.mac > div.lines-content.monaco-editor-background > div.view-lines.monaco-mouse-cursor-text";
  //   waitForElement(MONACO_ROOT_ID, TIME_OUT)
  //     .then((leetCodeNode) => {
  //       setTimeout(() => {
  //         const newNode = leetCodeNode.cloneNode(true);
  //         ref.current?.appendChild(newNode);
  //       }, 5000);
  //       console.log("mounted");
  //     })
  //     .catch((_reason) =>
  //       console.error(
  //         `Unable to mount within ${TIME_OUT}ms - most likely due to LeetCode changing HTML page`
  //       )
  //     );
  // }, []);

  return (
    <ResizableBox
      width={200}
      axis="x"
      resizeHandles={["w"]}
      className="h-full flex relative"
      handle={VerticalHandle}
    >
      <div className="w-full box-border ml-2 rounded-lg bg-layer-1 dark:bg-dark-layer-1 h-full">
        <EditorProvider defaultActiveId="Nick">
          <Tab id="Nick" displayHeader="Nick">
            {/* <button
              onClick={async () => {
                const value = await editor?.getValue();
                setValue(value);
              }}
            >
              Get Value
            </button>
            <button
              onClick={async () => {
                await editor?.setValue("Hello world");
              }}
            >
              Set Value
            </button>
            <div>{value}</div> */}

            <video ref={localVideoRef} autoPlay muted />
            <video ref={remoteVideoRef} autoPlay />
            <button
              id="webcamButton"
              ref={webcamButtonRef}
              onClick={async () => {
                localStream = await navigator.mediaDevices.getUserMedia({
                  video: true,
                  audio: true,
                });
                remoteStream = new MediaStream();

                // Push tracks from local stream to peer connection
                localStream.getTracks().forEach((track) => {
                  pc.addTrack(track, localStream);
                });

                // Pull tracks from remote stream, add to video stream
                pc.ontrack = (event) => {
                  console.log("adding track for remote");
                  event.streams[0].getTracks().forEach((track) => {
                    remoteStream.addTrack(track);
                  });
                };
                if (
                  localVideoRef.current &&
                  remoteVideoRef.current &&
                  callButtonRef.current &&
                  answerButtonRef.current &&
                  webcamButtonRef.current
                ) {
                  localVideoRef.current.srcObject = localStream;
                  remoteVideoRef.current.srcObject = remoteStream;
                  callButtonRef.current.disabled = false;
                  answerButtonRef.current.disabled = false;
                  webcamButtonRef.current.disabled = true;
                }
              }}
            >
              Start webcam
            </button>
            <br></br>
            <button
              id="callButton"
              ref={callButtonRef}
              onClick={async () => {
                const callDoc = doc(collection(firestore, "calls"));
                const offerCandidates = collection(callDoc, "offerCandidates");
                const answerCandidates = collection(
                  callDoc,
                  "answerCandidates"
                );

                setCallInput(callDoc.id);

                // Get candidates for caller, save to db
                pc.onicecandidate = async (event) => {
                  event.candidate &&
                    (await addDoc(offerCandidates, event.candidate.toJSON()));
                };

                // Create offer
                const offerDescription = await pc.createOffer();
                await pc.setLocalDescription(offerDescription);

                const offer = {
                  sdp: offerDescription.sdp,
                  type: offerDescription.type,
                };

                await setDoc(callDoc, { offer });

                // Listen for remote answer
                onSnapshot(callDoc, (snapshot) => {
                  console.dir(snapshot.data());
                  const data = snapshot.data();
                  if (!pc.currentRemoteDescription && data?.answer) {
                    const answerDescription = new RTCSessionDescription(
                      data.answer
                    );
                    pc.setRemoteDescription(answerDescription);
                  }
                });

                // When answered, add candidate to peer connection
                onSnapshot(answerCandidates, (snapshot) => {
                  snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                      const candidate = new RTCIceCandidate(change.doc.data());
                      pc.addIceCandidate(candidate);
                    }
                  });
                });
                if (hangupButtonRef.current)
                  hangupButtonRef.current.disabled = false;
              }}
            >
              Create Call (offer)
            </button>
            <br></br>
            <input
              id="callInput"
              value={callInput}
              onChange={(e) => setCallInput(e.target.value)}
            />
            <br></br>
            <button
              id="answerButton"
              ref={answerButtonRef}
              onClick={async () => {
                console.log("answering Calls");
                const callId = callInput;
                const callDoc = doc(firestore, "calls", callId);

                const answerCandidates = collection(
                  callDoc,
                  "answerCandidates"
                );
                const offerCandidates = collection(callDoc, "offerCandidates");

                pc.onicecandidate = async (event) => {
                  event.candidate &&
                    (await addDoc(answerCandidates, event.candidate.toJSON()));
                };

                const callData = (await getDoc(callDoc)).data();
                if (!callData) {
                  return;
                }
                const offerDescription = callData.offer;

                await pc.setRemoteDescription(
                  new RTCSessionDescription(offerDescription)
                );

                const answerDescription = await pc.createAnswer();
                await pc.setLocalDescription(answerDescription);

                const answer = {
                  type: answerDescription.type,
                  sdp: answerDescription.sdp,
                };

                await updateDoc(callDoc, { answer });

                onSnapshot(offerCandidates, (snapshot) => {
                  snapshot.docChanges().forEach((change) => {
                    if (change.type === "added") {
                      const data = change.doc.data();
                      pc.addIceCandidate(new RTCIceCandidate(data));
                    }
                  });
                });
              }}
            >
              Answer
            </button>
            <br></br>
            <button
              onClick={() => {
                pc.close();
              }}
            >
              Hang up
            </button>
          </Tab>
          <Tab id="Hung" displayHeader="Hung">
            Bye world
          </Tab>
        </EditorProvider>
        <div ref={ref}></div>
      </div>
    </ResizableBox>
  );
};

export default AppPanel;
