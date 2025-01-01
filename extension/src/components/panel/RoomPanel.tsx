import React from "react";
import { useRTC } from "@cb/hooks/index";
<<<<<<< Updated upstream
import { sendMessage } from "@cb/services";
import { EditorProvider, EditorTab } from "@cb/components/panel/editor";

export const RoomPanel = () => {
  const { informations, sendMessages, connected } = useRTC();

  const sendCode = React.useCallback(async () => {
    sendMessages(
      JSON.stringify({
        code: await sendMessage({ action: "getValue" }),
        changes: document.querySelector("#trackEditor")?.textContent ?? "{}",
      })
    );
  }, [sendMessages]);

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
  }, [connected, sendCode]);
=======
import { EditorProvider, EditorTab } from "@cb/components/panel/editor";

export const RoomPanel = () => {
  const { informations } = useRTC();
>>>>>>> Stashed changes

  return (
    <EditorProvider
      defaultActiveId={Object.keys(informations)[0]}
      informations={Object.keys(informations)}
    >
      {Object.entries(informations).map(([id, info]) => (
        <EditorTab key={id} id={id} displayHeader={id} {...JSON.parse(info)} />
      ))}
    </EditorProvider>
  );
};
