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
  const { tabs, activeTab, unblur, setActive, selectTest } = useTab({
    informations,
  });
  const [codePreference, setCodePreference] = React.useState<
    ExtensionStorage["codePreference"]
  >(CodeBuddyPreference.codePreference);

  const canViewCode = activeTab?.viewable ?? false;
  const activeTest = activeTab?.tests.find((test) => test.selected);

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
