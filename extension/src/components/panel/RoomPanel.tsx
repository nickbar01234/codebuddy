import { useRTC } from "@cb/hooks/index";
import { sendMessage } from "@cb/services";
import React from "react";
import EditorProvider, { Tab } from "./editor";

const RoomPanel = () => {
  const { informations, sendMessages, connected } = useRTC();

  const sendCode = async () => {
    console.log("sendCode");
    sendMessages(
      JSON.stringify({
      code: await sendMessage({ action: "getValue" }),
      changes:document.querySelector("#trackEditor")?.textContent ?? "{}",
      })
    );
  };

  React.useEffect(() => {
    sendCode();
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
  }, [connected]);

  if (Object.keys(informations).length === 0) return null;

  return (
    <EditorProvider defaultActiveId={Object.keys(informations)[0]}>
      {Object.entries(informations).map(([id, info]) => (
        <Tab key={id} id={id} displayHeader={id} {...JSON.parse(info)} />
      ))}{" "}
    </EditorProvider>
  );
};

export default RoomPanel;
