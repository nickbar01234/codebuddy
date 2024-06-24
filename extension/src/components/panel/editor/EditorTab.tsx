import React, { useEffect } from "react";
import { TabMetadata, editorProviderContext } from "./EditorProvider";
import { useOnMount } from "@cb/hooks";
import { sendMessage } from "@cb/services";
import { set } from "mongoose";

interface TabProps extends TabMetadata {
  code: {
    value: string;
    language: string;
  };
  changes: string;
}

export const EditorTab = (props: TabProps) => {
  const { id, displayHeader } = props;
  const { activeId, registerTab } = React.useContext(editorProviderContext);
  const [changeUser, setChangeUser] = React.useState(false);

  useOnMount(() => {
    registerTab({ id: id, displayHeader: displayHeader });
    sendMessage({
      action: "createModel",
      id: "CodeBuddyEditor",
      code: props.code.value,
      language: props.code.language,
    });
    console.log("register");
  });
  React.useEffect(() => {
    setChangeUser(true);
  }, [activeId]);
  React.useEffect(() => {
    if (activeId === id) {
      sendMessage({
        action: "setValueOtherEditor",
        code: props.code.value,
        language: props.code.language,
        changes: props.changes !== "" ? JSON.parse(props.changes) : {},
        changeUser: changeUser,
      });
      setChangeUser(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, id, props.code.value, props.code.language]);
  return (
    <div className={activeId === id ? "h-full flex flex-col " : "hidden"}>
      <h1>Language: {props.code.language}</h1>
      <button
        onClick={() => {
          sendMessage({
            action: "setValue",
            value: props.code.value,
          });
        }}
      >
        Paste Code
      </button>
    </div>
  );
};
