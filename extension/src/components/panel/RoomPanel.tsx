import React from "react";
import { useRTC } from "@cb/hooks/index";
import { EditorProvider, EditorTab } from "@cb/components/panel/editor";

export const RoomPanel = () => {
  const { informations } = useRTC();

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
