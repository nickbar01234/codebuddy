import React from "react";
import { TabMetadata, editorProviderContext } from "./EditorProvider";
import { useOnMount } from "@cb/hooks";
import { sendMessage } from "@cb/services";

interface TabProps extends TabMetadata {
  codeHTML: string;
  code: string;
}

const Tab = (props: TabProps) => {
  const { id, displayHeader, codeHTML } = props;
  const { activeId, registerTab } = React.useContext(editorProviderContext);
  const codeContainerRef = React.useRef<null | HTMLDivElement>(null);

  useOnMount(() => registerTab({ id: id, displayHeader: displayHeader }));

  React.useEffect(() => {
    if (codeContainerRef.current != null) {
      codeContainerRef.current.innerHTML = codeHTML;
    }
  }, [codeHTML]);

  return (
    <div className={activeId === id ? "h-full flex flex-col" : "hidden"}>
      <button
        onClick={() => {
          sendMessage({
            action: "setValue",
            value: props.code,
          });
        }}
      >
        Paste Code
      </button>
      <div dangerouslySetInnerHTML={{ __html: codeHTML }} />
    </div>
  );
};

export default Tab;
