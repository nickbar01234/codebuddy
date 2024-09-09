import { useOnMount } from "@cb/hooks";
import { sendMessage } from "@cb/services";
import React from "react";
import { TabMetadata, editorProviderContext } from "./EditorProvider";

interface TabProps extends TabMetadata {
  code: {
    value: string;
    language: string;
  };
  changes: string;
}

export const EditorTab = (props: TabProps) => {
  const { id } = props;
  const { activeId } = React.useContext(editorProviderContext);
  const [changeUser, setChangeUser] = React.useState(false);

  useOnMount(() => {
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
    <div
      data-active={activeId === id}
      className="flex h-8 w-full items-center gap-x-2 data-[active=false]:hidden border-b p-1 border-[#0000000f] overflow-x-auto whitespace-nowrap"
    >
      <h1>{props.code.language}</h1>
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
