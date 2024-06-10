import { ResizableBox } from "react-resizable";
import { VerticalHandle } from "./Handle";
import EditorProvider, { Tab } from "./editor";
import React, { useEffect } from "react";
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

  const sendCode = async () => {
    const MONACO_ROOT_ID = "#editor";
    await waitForElement(MONACO_ROOT_ID, 2000);
    // await waitForElement(
    //   "div.overflow-guard > div.monaco-scrollable-element.editor-scrollable.vs-dark.mac > div.lines-content.monaco-editor-background > div.view-lines.monaco-mouse-cursor-text",
    //   2000
    // );

    const originNode = document.querySelector(MONACO_ROOT_ID) as HTMLElement;
    const leetCodeNode = originNode.cloneNode(true) as HTMLElement;
    // leetCodeNode.style.wid= "100%";
    // leetCodeNode.style.height = "100%";
    // // const insideDiv2 = leetCodeNode.querySelector(
    // //   "#CodeBuddy > div > div.w-full.box-border.ml-2.rounded-lg.bg-layer-1.dark\:bg-dark-layer-1.h-full > div.h-full.flex.flex-col > div > div > div.overflow-guard > div.monaco-scrollable-element.editor-scrollable.vs-dark.mac"
    // // ) as HTMLElement;

    // const insideDiv = leetCodeNode.querySelector(
    //   "div.overflow-guard > div.monaco-scrollable-element.editor-scrollable.vs-dark.mac > div.lines-content.monaco-editor-background > div.view-lines.monaco-mouse-cursor-text"
    // ) as HTMLElement;
    // insideDiv.style.width = "100%";
    // insideDiv.style.height = "100%";

    sendMessages(
      JSON.stringify({
        code: await editor?.getValue(),
        codeHTML: leetCodeNode.outerHTML,
      })
    );
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

  return (
    <ResizableBox
      width={200}
      axis="x"
      resizeHandles={["w"]}
      className="h-full flex relative"
      handle={VerticalHandle}
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
