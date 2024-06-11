import React from "react";
import { TabMetadata, editorProviderContext } from "./EditorProvider";
import { useOnMount } from "@cb/hooks";
import { sendMessage } from "@cb/services";

interface TabProps extends TabMetadata {
  code: {
    value: string;
    language: string;
  };
}

const Tab = (props: TabProps) => {
  const { id, displayHeader } = props;
  const { activeId, registerTab } = React.useContext(editorProviderContext);

  const updateCode = () =>
    sendMessage({
      action: "setValueOtherEditor",
      code: props.code.value,
      language: props.code.language,
    });
  useOnMount(() => {
    registerTab({ id: id, displayHeader: displayHeader });
  });
  React.useEffect(() => {
    updateCode();
  }, []);

  React.useEffect(() => {
    console.log(props.code.value);
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
