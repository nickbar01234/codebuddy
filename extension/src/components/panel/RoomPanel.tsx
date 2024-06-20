import { useRTC } from "@cb/hooks/index";
import { waitForElement } from "@cb/utils";
import React from "react";
import { sendMessage } from "@cb/services";
import { EditorProvider, EditorTab } from "@cb/components/panel/editor";

export const RoomPanel = () => {
  const { informations, sendMessages, connected } = useRTC();

  const sendCode = async () => {
    const MONACO_ROOT_ID = "#editor";
    await waitForElement(MONACO_ROOT_ID, 2000);

    const originNode = document.querySelector(MONACO_ROOT_ID) as HTMLElement;
    const leetCodeNode = originNode.cloneNode(true) as HTMLElement;

    sendMessages(
      JSON.stringify({
        code: await sendMessage({ action: "getValue" }),
        codeHTML: leetCodeNode.outerHTML,
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
      const observer = new MutationObserver(async () => {
        await sendCode();
      });
      observer.observe(document, {
        childList: true,
        subtree: true,
      });
      return () => {
        observer.disconnect();
      };
    }
  }, [connected]);

  if (Object.keys(informations).length === 0) return null;

  return (
    <EditorProvider defaultActiveId={Object.keys(informations)[0]}>
      {Object.entries(informations).map(([id, info]) => (
        <EditorTab key={id} id={id} displayHeader={id} {...JSON.parse(info)} />
      ))}
    </EditorProvider>
  );
};
