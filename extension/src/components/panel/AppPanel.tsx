import { useEffect, useRef } from "react";
import { ResizableBox } from "react-resizable";
import { useMonaco } from "../../hooks/useMonaco";
import { useRTC } from "../../hooks/useRTC";
import { waitForElement } from "../../utils";
import { VerticalHandle } from "./Handle";
import EditorProvider, { Tab } from "./editor";

const AppPanel = () => {
  const otherCodeRef = useRef<HTMLDivElement>(null);
  const {
    createOffer,
    answerOffer,
    callInput,
    setCallInput,
    closeCall,
    sendMessage,
    messageGot,
  } = useRTC();
  const editor = useMonaco();
  let code = "";

  if (otherCodeRef.current && messageGot) {
    otherCodeRef.current.innerHTML = JSON.parse(messageGot).outerHTML;
    code = JSON.parse(messageGot).code;
  }
  async function gettingLeetCodeNode() {
    const MONACO_ROOT_ID =
      "#editor > div.flex.flex-1.flex-col.overflow-hidden.pb-2 > div.flex-1.overflow-hidden > div > div > div.overflow-guard > div.monaco-scrollable-element.editor-scrollable.vs-dark.mac > div.lines-content.monaco-editor-background > div.view-lines.monaco-mouse-cursor-text";
    const leetCodeNode = await waitForElement(MONACO_ROOT_ID, 2000);
    return leetCodeNode;
  }

  async function gettingCode() {
    const leetCodeNode = await gettingLeetCodeNode();
    const outerHTML = leetCodeNode.outerHTML;
    const code = await editor?.getValue();
    return { code: code, outerHTML: outerHTML };
  }

  const sendCode = async () => {
    const message = await gettingCode();
    sendMessage(JSON.stringify(message));
  };

  useEffect(() => {
    const observer = new MutationObserver(async (mutations) => {
      console.log("mutation");
      await sendCode();
    });
    observer.observe(document, {
      childList: true,
      subtree: true,
    });
    return () => {
      observer.disconnect();
    };
  }, [code, sendMessage]);

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
        <EditorProvider defaultActiveId="Nick">
          <Tab id="Nick" displayHeader="Nick">
            <div className="flex flex-col gap-2 ">
              <br></br>
              <button id="callButton" onClick={createOffer}>
                Create Call (offer)
              </button>
              <br></br>
              <input
                id="callInput"
                value={callInput}
                onChange={(e) => setCallInput(e.target.value)}
              />
              <br></br>
              <button id="answerButton" onClick={answerOffer}>
                Answer
              </button>
              <br></br>
              <button onClick={closeCall}>Hang up</button>
              <br></br>
              <button onClick={sendCode}>Send Code</button>
              <br></br>
              <button onClick={() => pasteCode(code)}>Paste code</button>
              <div>
                Others code:
                <br></br>
                <div ref={otherCodeRef}></div>
              </div>
              <br />
            </div>
          </Tab>
          <Tab id="Hung" displayHeader="Hung">
            Bye world
          </Tab>
        </EditorProvider>
      </div>
    </ResizableBox>
  );
};

export default AppPanel;
