import React from "react";
import { useOnMount, useRTC, useTab } from "@cb/hooks/index";
import { getStorage, sendServiceRequest, setStorage } from "@cb/services";
import { ResizableBox } from "react-resizable";
import { ExtensionStorage } from "@cb/types";
import { CodeBuddyPreference } from "@cb/constants";

export interface TabMetadata {
  id: string;
  displayHeader: string;
}

const EDITOR_NODE_ID = "CodeBuddyEditor";

const EditorPanel = () => {
  const { informations } = useRTC();
  const { tabs, activeTab, unblur, setActive } = useTab({ informations });
  const [codePreference, setCodePreference] = React.useState<
    ExtensionStorage["codePreference"]
  >(CodeBuddyPreference.codePreference);

  const canViewCode = activeTab?.viewable ?? false;

  useOnMount(() => {
    sendServiceRequest({ action: "createModel", id: EDITOR_NODE_ID });
  });

  useOnMount(() => {
    getStorage("codePreference").then(setCodePreference);
  });

  return (
    <div
      data-tabs={tabs.length}
      className="flex flex-col h-full data-[tabs=0]:hidden"
    >
      {!canViewCode && tabs.length != 0 && (
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg z-50"
          onClick={unblur}
        >
          View
        </button>
      )}
      <div
        data-view-code={canViewCode}
        className="data-[view-code=false]:blur h-full w-full"
      >
        <ResizableBox
          height={codePreference.height}
          axis="y"
          resizeHandles={canViewCode ? ["s"] : undefined}
          className="h-full flex relative w-full"
          maxConstraints={[Infinity, 600]}
          handle={
            <div className="absolute bottom-0 h-2 bg-layer-bg-gray dark:bg-layer-bg-gray w-full">
              <div className="relative top-1/2 -translate-y-1/2 flexlayout__splitter flexlayout__splitter_horz w-full h-[2px] hover:after:h-full hover:after:bg-[--color-splitter-drag] after:h-[2px] after:bg-[--color-splitter] cursor-ns-resize" />
            </div>
          }
          onResize={(_e, data) =>
            setCodePreference({ ...codePreference, height: data.size.height })
          }
          onResizeStop={(_e, data) => {
            setStorage({
              codePreference: { ...codePreference, height: data.size.height },
            });
            sendServiceRequest({
              action: "updateEditorLayout",
              monacoEditorId: "CodeBuddy",
            });
          }}
        >
          <div className="relative h-full flex flex-col grow gap-y-2">
            {/* todo(nickbar01234): Language + paste code */}
            <h1 className=" text-xl font-extrabold text-gray-900 dark:text-white ">
              Language:{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">
                {/* {props.code.language} */}
                Python
              </span>{" "}
            </h1>
            <button
              type="button"
              data-tooltip-target="tooltip-default"
              onClick={() => {
                // sendMessage({
                //   action: "setValue",
                //   value: props.code.value,
                // });
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
            <div
              id={EDITOR_NODE_ID}
              className="w-full overflow-hidden h-full"
            />
          </div>
        </ResizableBox>
        <div className="w-full h-full">Test cases here</div>
      </div>
      <div className="flex items-center w-full bg-[--color-tabset-tabbar-background] h-9 rounded-b-lg p-2 overflow-x-auto overflow-y-hidden text-sm self-end">
        {tabs.map(({ id, active }) => (
          <React.Fragment key={id}>
            {/* Leetcode className flexlayout__tab_button_* */}
            <div
              className={`relative flexlayout__tab_button flexlayout__tab_button_top hover:z-50 ${
                active
                  ? "flexlayout__tab_button-selected medium"
                  : "flexlayout__tab_button--unselected normal"
              }`}
              onClick={() => setActive(id)}
            >
              {id}
            </div>
            {/* Leetcode className flexlayout__tabset_tab_divider */}
            <div className="flexlayout__tabset_tab_divider" />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default EditorPanel;
