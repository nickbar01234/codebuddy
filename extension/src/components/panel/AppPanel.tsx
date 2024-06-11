import { useOnMount, useRTC } from "@cb/hooks";
import {
  getStorage,
  sendMessage as sendServiceMessage,
  setStorage,
} from "@cb/services";
import { ExtensionStorage } from "@cb/types";
import React from "react";
import { ResizableBox } from "react-resizable";
import { VerticalHandle } from "./Handle";
import EditorProvider, { Tab } from "./editor";
import { sendMessage } from "@cb/services";

const AppPanel = () => {
  const [editorPreference, setEditorPreference] = React.useState<
    ExtensionStorage["editorPreference"] | null
  >(null);

  useOnMount(() => {
    getStorage("editorPreference").then(setEditorPreference);
  });
  chrome.runtime.onMessage.addListener((request) => {
    console.log("Receiving");
    console.dir(request);
  });
  // TODO(nickbar01234) - Handle loading indicator
  const {
    createRoom,
    joinRoom,
    leaveRoom,
    roomId: hostId,
    sendMessages,
    informations,
    connected,
  } = useRTC();

  const [roomId, setRoomId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (connected) {
      const sendCode = async () => {
        sendMessages(
          JSON.stringify({
            code: await sendServiceMessage({ action: "getValue" }),
          })
        );
      };
      sendCode();
      const observer = new MutationObserver(async () => {
        await sendCode();
      });
      observer.observe(document, {
        childList: true,
        subtree: true,
      });
      sendMessage({
        action: "createModel",
        id: "BuddyEditor",
        code: "",
        language: "plaintext",
      });

      return () => {
        observer.disconnect();
      };
    }
  }, [connected]);

  if (editorPreference == null) {
    return null;
  }

  return (
    <ResizableBox
      width={editorPreference.width}
      axis="x"
      resizeHandles={["w"]}
      className="h-full flex relative"
      handle={VerticalHandle}
      onResize={(_e, data) =>
        setEditorPreference({
          ...editorPreference,
          width: data.size.width,
        })
      }
      onResizeStop={(_e, data) =>
        setStorage({
          editorPreference: {
            ...editorPreference,
            width: data.size.width,
          },
        })
      }
    >
      <div className="w-full box-border ml-2 rounded-lg bg-layer-1 dark:bg-dark-layer-1 h-full">
        <div className="flex flex-col">
          <button onClick={createRoom}>Create Room</button>
          <div> Host Id: {hostId}</div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(hostId ?? "");
            }}
          >
            Copy Host Id
          </button>
          <input
            value={roomId ?? ""}
            onChange={(e) => {
              setRoomId(e.target.value);
            }}
          ></input>
          <button
            onClick={() => {
              joinRoom(roomId ?? "");
            }}
          >
            Join Room
          </button>
          <button onClick={leaveRoom}>Leave Room</button>
        </div>
        <div
          id={"BuddyEditor"}
          style={{
            height: "50vh",
            width: "100%",
          }}
        />
        {Object.keys(informations).length > 0 && (
          <EditorProvider defaultActiveId={Object.keys(informations)[0]}>
            {Object.entries(informations).map(([id, info]) => (
              <Tab key={id} id={id} displayHeader={id} {...JSON.parse(info)} />
            ))}
          </EditorProvider>
        )}
      </div>
    </ResizableBox>
  );
};

export default AppPanel;
