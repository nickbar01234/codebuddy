/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef } from "react";
import { ResizableBox } from "react-resizable";
import { waitForElement } from "../../utils";
import { VerticalHandle } from "./Handle";
import EditorProvider, { Tab } from "./editor";
import { useMonaco } from "@hooks/useMonaco";
import { useState } from "react";

const AppPanel = () => {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useMonaco();
  const [value, setValue] = useState<string>("");
  useEffect(() => {
    console.log(value);
  }, [value]);
  useEffect(() => {
    const TIME_OUT = 2000; // ms
    const MONACO_ROOT_ID =
      "#editor > div.flex.flex-1.flex-col.overflow-hidden.pb-2 > div.flex-1.overflow-hidden > div > div > div.overflow-guard > div.monaco-scrollable-element.editor-scrollable.vs-dark.mac > div.lines-content.monaco-editor-background > div.view-lines.monaco-mouse-cursor-text";
    waitForElement(MONACO_ROOT_ID, TIME_OUT)
      .then((leetCodeNode) => {
        setTimeout(() => {
          const newNode = leetCodeNode.cloneNode(true);
          ref.current?.appendChild(newNode);
        }, 5000);
        console.log("mounted");
      })
      .catch((_reason) =>
        console.error(
          `Unable to mount within ${TIME_OUT}ms - most likely due to LeetCode changing HTML page`
        )
      );
  }, []);
  return (
    // TODO(nickbar01234) - Save user preference in local storage

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
            Hello world
            <button
              onClick={async () => {
                console.log("Click Getting value");
                const value = await editor?.getValue();
                console.log("done");
                setValue(value);
              }}
            >
              Get Value
            </button>
            <button
              onClick={async () => {
                console.log("Click Setting value");
                await editor?.setValue("Hello world");
                console.log("done");
              }}
            >
              Set Value
            </button>
            <div>{value}</div>
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
