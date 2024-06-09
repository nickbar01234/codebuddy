import { ResizableBox } from "react-resizable";
import { VerticalHandle } from "./Handle";
import EditorProvider, { Tab } from "./editor";
import React from "react";
import { useRTC } from "@cb/hooks";
import { sendMessage as sendServiceMessage } from "@cb/services";
import { waitForElement } from "@cb/utils";

const AppPanel = () => {
  const {
    createRoom,
    joinRoom,
    leaveRoom,
    roomId: hostId,
    sendMessages,
    informations,
  } = useRTC();
  const [roomId, setRoomId] = React.useState<string | null>(null);

  const editor = {
    getValue: () => sendServiceMessage({ action: "getValue" }),
    setValue: (code: string) =>
      sendServiceMessage({ action: "setValue", value: code }),
  };

  async function gettingLeetCodeNode() {
    const MONACO_ROOT_ID =
      "#editor > div.flex.flex-1.flex-col.overflow-hidden.pb-2 > div.flex-1.overflow-hidden > div > div";
    const leetCodeNode = await waitForElement(MONACO_ROOT_ID, 2000);
    return leetCodeNode;
  }

  async function gettingCode() {
    const leetCodeNode = await gettingLeetCodeNode();
    const outerHTML = leetCodeNode.outerHTML;
    const code = await editor?.getValue();
    return code;
  }

  const sendCode = async () => {
    const message = await gettingCode();
    sendMessages(message);
  };

  React.useEffect(() => {
    const observer = new MutationObserver(async (mutations) => {
      await sendCode();
    });
    observer.observe(document, {
      childList: true,
      subtree: true,
    });
    return () => {
      observer.disconnect();
    };
  }, []);
  const pasteCode = async (code: string) => {
    await editor?.setValue(code);
  };
  console.log(informations);
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
            <div className="flex flex-col">
              <button onClick={createRoom}>Create Room</button>
              <div> Host Id: {hostId}</div>
              <input
                value={roomId ?? ""}
                onChange={(e) => {
                  setRoomId(e.target.value);
                }}
              ></input>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(hostId ?? "");
                }}
              >
                Copy Host Id
              </button>
              <button
                onClick={() => {
                  joinRoom(roomId ?? "");
                }}
              >
                Join Room
              </button>
              <button onClick={() => sendMessages("Hello")}>Say HI</button>
              <button onClick={leaveRoom}>Leave Room</button>
              <div className="flex flex-col">
                {Object.keys(informations).map((username, index) => (
                  <div key={username}>
                    {username}: {informations[username]}
                  </div>
                ))}
              </div>
            </div>
          </Tab>
          <Tab id="Hung" displayHeader="Hung"></Tab>
        </EditorProvider>
      </div>
    </ResizableBox>
  );
};

export default AppPanel;
