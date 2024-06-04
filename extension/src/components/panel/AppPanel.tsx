/* eslint-disable @typescript-eslint/no-explicit-any */
import { ResizableBox } from "react-resizable";
import { VerticalHandle } from "./Handle";
import { waitForElement } from "../../utils";
import { useEffect, useState, useRef } from "react";
import EditorProvider, { Tab } from "./editor";

const newString = `<div style="top:8px;height:20px;" class="view-line"><span><span class="mtk3">/**</span></span></div>`;
const AppPanel = () => {
  const ref = useRef<HTMLDivElement>(null);
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
      })
      .catch((_reason) =>
        console.error(
          `Unable to mount within ${TIME_OUT}ms - most likely due to LeetCode changing HTML page`
        )
      );
    chrome.devtools.inspectedWindow.getResources((resources) => {
      console.log(resources);
    });
    console.log("hihih");
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
