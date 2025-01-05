import React from "react";
import { useOnMount, useRTC, useTab } from "@cb/hooks/index";
import { getStorage, sendServiceRequest, setStorage } from "@cb/services";
import { ResizableBox } from "react-resizable";
import { ExtensionStorage } from "@cb/types";
import { CodeBuddyPreference } from "@cb/constants";
import { Ripple } from "@cb/components/ui/Ripple";
import { State, stateContext } from "@cb/context/StateProvider";
export interface TabMetadata {
  id: string;
  displayHeader: string;
}

export const EDITOR_NODE_ID = "CodeBuddyEditor";

const EditorPanel = () => {
  const { informations } = useRTC();
  const {
    tabs,
    activeTab,
    unblur,
    setActive,
    activeUserInformation,
    pasteCode,
    selectTest,
  } = useTab({
    informations,
  });
  const { state } = React.useContext(stateContext);

  const [codePreference, setCodePreference] = React.useState<
    ExtensionStorage["codePreference"]
  >(CodeBuddyPreference.codePreference);

  const canViewCode = activeTab?.viewable ?? false;
  const activeTest = activeTab?.tests.find((test) => test.selected);

  useOnMount(() => {
    getStorage("codePreference").then(setCodePreference);
  });

  return (
    <>
      {tabs.length === 0 &&
        state === State.ROOM &&
        JSON.parse(localStorage.getItem("curRoomId") || "{}").numberOfUsers ==
          0 && (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="relative flex h-[500px] w-full flex-col items-center justify-center overflow-hidden rounded-lg ">
              <div
                className={
                  "z-10 flex size-12 items-center justify-center rounded-full border-2 bg-white p-3 shadow-[0_0_20px_-12px_rgba(0,0,0,0.8)]"
                }
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#000000"
                  strokeWidth="2"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </div>
              <Ripple />
            </div>
          </div>
        )}
      <div
        className="flex flex-col h-full justify-between"
        style={{ visibility: tabs.length === 0 ? "hidden" : "visible" }} // dont know why but it does not trigger rerender when joining the room for the first time
      >
        {/* todo(nickbar01234): Fix styling */}
        {!canViewCode && tabs.length != 0 && (
          <button
            className="hover:bg-fill-quaternary dark:hover:bg-fill-quaternary text-label-1 dark:text-dark-label-1 font-bold py-2 px-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg z-50"
            onClick={unblur}
            type="button"
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
              setCodePreference({
                ...codePreference,
                height: data.size.height,
              })
            }
            onResizeStop={(_e, data) => {
              setStorage({
                codePreference: {
                  ...codePreference,
                  height: data.size.height,
                },
              });
              sendServiceRequest({
                action: "updateEditorLayout",
                monacoEditorId: "CodeBuddy",
              });
            }}
          >
            <div className="relative h-full flex flex-col grow gap-y-2">
              {/* todo(nickbar01234): Language + paste code */}
              <div className="flex justify-between">
                {" "}
                <h1 className=" text-xl font-extrabold text-gray-900 dark:text-white ">
                  Language:{" "}
                  <span className="text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-sky-400">
                    {activeUserInformation?.code?.code.language}
                  </span>
                </h1>
                <button
                  type="button"
                  data-tooltip-target="tooltip-default"
                  onClick={pasteCode}
                  className="text-white  justify-between hover:bg-fill-quaternary dark:hover:bg-fill-quaternary focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center me-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
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
                  <span className=" ml-2">Paste Code</span>
                </button>
              </div>

              <div
                id={EDITOR_NODE_ID}
                className="w-full overflow-hidden h-full"
              />
            </div>
          </ResizableBox>
          <div className="w-full h-full overflow-auto">
            <div className="mx-5 my-4 flex flex-col space-y-4">
              <div className="flex w-full flex-row items-start justify-between gap-4">
                <div className="flex flex-nowrap items-center gap-x-2 gap-y-4 overflow-x-scroll hide-scrollbar">
                  {activeTab?.tests.map((test, idx) => (
                    <div key={idx} onClick={() => selectTest(idx)}>
                      {test.selected ? (
                        <button className="font-medium items-center whitespace-nowrap focus:outline-none inline-flex bg-fill-3 dark:bg-dark-fill-3 hover:bg-fill-2 dark:hover:bg-dark-fill-2 relative rounded-lg px-4 py-1 hover:text-label-1 dark:hover:text-dark-label-1 text-label-1 dark:text-dark-label-1">
                          Case {idx + 1}
                        </button>
                      ) : (
                        <button className="font-medium items-center whitespace-nowrap focus:outline-none inline-flex hover:bg-fill-2 dark:hover:bg-dark-fill-2 text-label-2 dark:text-dark-label-2 relative rounded-lg px-4 py-1 hover:text-label-1 dark:hover:text-dark-label-1 bg-transparent dark:bg-dark-transparent">
                          Case {idx + 1}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex h-full w-full flex-col space-y-2">
                    {activeTest?.test.map((assignment, idx) => (
                      <React.Fragment key={idx}>
                        <div className="text-xs font-medium text-label-3 dark:text-dark-label-3">
                          {assignment.variable} =
                        </div>
                        <div className="font-menlo w-full cursor-text rounded-lg border px-3 py-[10px] bg-fill-3 dark:bg-dark-fill-3 border-transparent">
                          <div
                            className="font-menlo w-full resize-none whitespace-pre-wrap break-words outline-none placeholder:text-label-4 dark:placeholder:text-dark-label-4 sentry-unmask"
                            contentEditable="true"
                          >
                            {assignment.value}
                          </div>
                        </div>
                      </React.Fragment>
                    )) ?? null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center w-full bg-[--color-tabset-tabbar-background] h-12 rounded-b-lg p-2 overflow-x-auto overflow-y-hidden text-sm self-end">
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
    </>
  );
};

export default EditorPanel;
