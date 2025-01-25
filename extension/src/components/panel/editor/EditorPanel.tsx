import { LoadingPanel } from "@cb/components/panel/LoadingPanel";
import { AppState } from "@cb/context/AppStateProvider";
import {
  useAppState,
  usePeerSelection,
  useWindowDimensions,
} from "@cb/hooks/index";
import { cn } from "@cb/utils/cn";
import React from "react";
import { ResizableBox } from "react-resizable";
import EditorToolBar from "./EditorToolBar";

export interface TabMetadata {
  id: string;
  displayHeader: string;
}

export const EDITOR_NODE_ID = "CodeBuddyEditor";

const EditorPanel = () => {
  const { peers, activePeer, unblur, setActivePeerId, selectTest, isBuffer } =
    usePeerSelection();
  const { state: appState } = useAppState();
  const { setCodePreferenceHeight, onResizeStop, codePreference, height } =
    useWindowDimensions();

  const canViewCode = activePeer?.viewable ?? false;
  const activeTest = activePeer?.tests.find((test) => test.selected);
  const emptyRoom = peers.length === 0;

  return (
    <>
      {!isBuffer && emptyRoom && appState === AppState.ROOM && (
        <LoadingPanel numberOfUsers={peers.length} />
      )}
      <div
        className={cn("flex flex-col relative h-full w-full", {
          hidden: emptyRoom,
        })}
      >
        {/* todo(nickbar01234): Fix styling */}
        {!canViewCode && (
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
            minConstraints={[Infinity, height * 0.2]}
            maxConstraints={[Infinity, height * 0.5]}
            handle={
              <div className="absolute bottom-0 h-2 bg-layer-bg-gray dark:bg-layer-bg-gray w-full">
                <div className="relative top-1/2 -translate-y-1/2 flexlayout__splitter flexlayout__splitter_horz w-full h-[2px] hover:after:h-full hover:after:bg-[--color-splitter-drag] after:h-[2px] after:bg-[--color-splitter] cursor-ns-resize" />
              </div>
            }
            onResize={(_e, data) => setCodePreferenceHeight(data.size.height)}
            onResizeStop={onResizeStop}
          >
            <div className="relative h-full flex flex-col grow gap-y-2 w-full">
              <EditorToolBar />
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
                  {activePeer?.tests.map((test, idx) => (
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
          {peers.map(({ id, active }) => (
            <React.Fragment key={id}>
              {/* Leetcode className flexlayout__tab_button_* */}
              <div
                className={cn(
                  `relative flexlayout__tab_button flexlayout__tab_button_top hover:z-50`,
                  {
                    "flexlayout__tab_button-selected medium": active,
                    "flexlayout__tab_button--unselected normal": !active,
                  }
                )}
                onClick={() => setActivePeerId(id)}
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
