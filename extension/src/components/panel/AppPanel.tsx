import { ResizableBox } from "react-resizable";
import { VerticalHandle } from "./Handle";
import EditorProvider, { Tab } from "./editor";
import React from "react";
import { useRTC } from "@cb/hooks";

const AppPanel = () => {
  const { createRoom, joinRoom, leaveRoom, roomId: hostId } = useRTC();
  const [roomId, setRoomId] = React.useState<string | null>(null);
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
            <div>
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
              <button onClick={leaveRoom}>Leave Room</button>
            </div>
          </Tab>
          <Tab id="Hung" displayHeader="Hung"></Tab>
        </EditorProvider>
      </div>
    </ResizableBox>
  );
};

export default AppPanel;
