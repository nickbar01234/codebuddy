import { useRTC } from "@cb/hooks/index";
import { waitForElement } from "@cb/utils";
import React from "react";
import { sendMessage } from "@cb/services";
import EditorProvider, { Tab } from "./editor";

const RoomPanel = () => {
  const { informations, sendMessages, connected } = useRTC();

  const sendCode = async () => {
    const MONACO_ROOT_ID = "#editor";
    await waitForElement(MONACO_ROOT_ID, 2000);

    const originNode = document.querySelector(MONACO_ROOT_ID) as HTMLElement;
    const leetCodeNode = originNode.cloneNode(true) as HTMLElement;
    const trackEditor = document.querySelector("#trackEditor");

    sendMessages(
      JSON.stringify({
        code: await sendMessage({ action: "getValue" }),
        codeHTML: leetCodeNode.outerHTML,
        changes: trackEditor?.textContent,
      })
    );
  };

  React.useEffect(() => {
    if (connected) {
      sendCode();
      sendMessage({
        action: "createModel",
        id: "CodeBuddyEditor",
        code: "",
        language: "plaintext",
      });
      const trackEditor = document.querySelector("#trackEditor");
      if (trackEditor) {
        const observer = new MutationObserver(async () => {
          await sendCode();
        });
        observer.observe(trackEditor, {
          childList: true,
          subtree: true,
        });
        return () => {
          observer.disconnect();
        };
      }
    }
  }, [connected]);

  if (Object.keys(informations).length === 0) return null;

  return (
    <EditorProvider defaultActiveId={Object.keys(informations)[0]}>
      <div className="flex flex-col">
        <div id="CodeBuddyEditor" className="h-[40vh] w-full"></div>
        {Object.entries(informations).map(([id, info]) => (
          <Tab key={id} id={id} displayHeader={id} {...JSON.parse(info)} />
        ))}{" "}
      </div>
    </EditorProvider>
  );
};

export default RoomPanel;
