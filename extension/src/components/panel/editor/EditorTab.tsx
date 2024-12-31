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
  const {
    id,
    code: { value, language },
  } = props;
  const { activeId } = React.useContext(editorProviderContext);

  React.useEffect(() => {
    sendMessage({
      action: "createModel",
      id: "CodeBuddyEditor",
      code: value,
      language: language,
    });
  }, [value, language]);

  React.useEffect(() => {
    if (activeId === id) {
      sendMessage({
        action: "setValueOtherEditor",
        code: props.code.value,
        language: props.code.language,
        changes: props.changes !== "" ? JSON.parse(props.changes) : {},
        changeUser: false,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, id, props.code.value, props.code.language]);

  return (
    <div
      data-active={activeId === id}
      className="flex h-10 w-full items-center gap-x-2 data-[active=false]:hidden border-b p-1 border-[#0000000f] overflow-x-auto overflow-y-hidden whitespace-nowrap justify-between"
    >
      <h1 className=" text-xl font-extrabold text-gray-900 dark:text-white ">
        Language:{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">
          {props.code.language}
        </span>{" "}
      </h1>
      <button
        type="button"
        data-tooltip-target="tooltip-default"
        onClick={() => {
          sendMessage({
            action: "setValue",
            value: props.code.value,
          });
        }}
        className="text-white  justify-between bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-clipboard-copy"
        >
          <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
          <path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          <path d="M16 4h2a2 2 0 0 1 2 2v4" />
          <path d="M21 14H11" />
          <path d="m15 10-4 4 4 4" />
        </svg>
        <span className=" ml-2"> Paste Code</span>
      </button>
    </div>
  );
};
