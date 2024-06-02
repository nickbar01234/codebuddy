import React from "react";
import { TabMetadata, editorProviderContext } from "./EditorProvider";
import { useOnMount } from "@hooks";

interface TabProps extends TabMetadata {
  children?: React.ReactNode;
}

const Tab = (props: TabProps) => {
  const { id, displayHeader, children } = props;
  const { activeId, registerTab } = React.useContext(editorProviderContext);

  useOnMount(() => registerTab({ id: id, displayHeader: displayHeader }));

  return <div className={activeId === id ? "block" : "hidden"}>{children}</div>;
};

export default Tab;
