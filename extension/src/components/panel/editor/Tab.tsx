import React from "react";
import { TabMetadata, editorProviderContext } from "./EditorProvider";
import { useOnMount } from "@cb/hooks";
import { sendMessage } from "@cb/services";

interface TabProps extends TabMetadata {
  code: {
    value: string;
    language: string;
  };
  changes: string;
}

const Tab = (props: TabProps) => {
  const { id, displayHeader } = props;
  const { activeId, registerTab } = React.useContext(editorProviderContext);

  const updateCode = () =>
    sendMessage({
      action: "setValueOtherEditor",
      code: props.code.value,
      language: props.code.language,
      changes: props.changes !== "" ? JSON.parse(props.changes) : {},
    });
  useOnMount(() => {
    registerTab({ id: id, displayHeader: displayHeader });
    updateCode();
    console.log("register");
  });

  React.useEffect(() => {
    if (activeId === id) {
      updateCode();
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

export default Tab;
