import QuestionSelector from "@cb/components/QuestionSelector";
import { RenderButton } from "@cb/components/ui/RenderButton";
import { AppState } from "@cb/context/AppStateProvider";
import { ROOMSTATE } from "@cb/context/RTCProvider";
import {
  useAppState,
  usePeerSelection,
  useRTC,
  useWindowDimensions,
} from "@cb/hooks/index";
import { cn } from "@cb/utils/cn";
import React from "react";
import { ResizableBox } from "react-resizable";
import { LoadingPanel } from "../LoadingPanel";
import EditorToolBar from "./EditorToolBar";
import { Skeleton } from "@cb/components/ui/Skeleton";
export interface TabMetadata {
  id: string;
  displayHeader: string;
}

export const EDITOR_NODE_ID = "CodeBuddyEditor";

const EditorPanel = () => {
  const { peers, activePeer, unblur, selectTest, isBuffer } =
    usePeerSelection();
  const { state: appState, setState: setAppState } = useAppState();
  const {
    setCodePreferenceHeight,
    onResizeStop,
    preference: { codePreference },
    height,
  } = useWindowDimensions();
  const {
    roomState,
    handleChooseQuestion,
    joiningBackRoom,
    handleNavigateToNextQuestion,
    peerState,
  } = useRTC();

  const canViewCode = activePeer?.viewable ?? false;
  const activeTest = activePeer?.tests.find((test) => test.selected);
  const emptyRoom = peers.length === 0;
  const unfinishedPeers = React.useMemo(
    () =>
      Object.entries(peerState)
        .filter(([_, state]) => !state.finished)
        .map(([peerId, state]) => ({ peerId, ...state })),
    [peerState]
  );

  return (
    <div
      className={cn("relative z-50 flex h-full w-full grow flex-col gap-y-2", {
        hidden: appState !== AppState.ROOM,
      })}
    >
      {roomState !== ROOMSTATE.CODE && (
        <div className="flex h-[40vh] w-full items-center justify-center rounded-t-lg p-2">
          {isBuffer ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <>
              {roomState === ROOMSTATE.WAIT && (
                <h1 className="mb-4 text-center text-lg font-semibold text-black dark:text-white">
                  Waiting for other to finish
                  <ul>
                    {unfinishedPeers.map(({ peerId, latency }) => (
                      <li key={peerId + latency}> {peerId} </li>
                    ))}
                  </ul>
                </h1>
              )}
              {roomState === ROOMSTATE.CHOOSE && (
                <QuestionSelector handleQuestionSelect={handleChooseQuestion} />
              )}

              {roomState === ROOMSTATE.DECISION && (
                <div className="flex w-full flex-col">
                  <h1 className="mb-4 text-center text-lg font-semibold text-black dark:text-white">
                    Do you want to go on to next question?
                  </h1>
                  <div className="flex justify-center gap-4">
                    <RenderButton
                      label="YES"
                      isYes={true}
                      onClick={handleNavigateToNextQuestion}
                    />
                    <RenderButton
                      label="NO"
                      isYes={false}
                      onClick={() => {
                        joiningBackRoom(false);
                        setAppState(AppState.ROOM);
                      }}
                    />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <div
        className={cn(
          "relative flex h-full w-full flex-col justify-between",
          {}
        )}
      >
        {isBuffer && emptyRoom && <Skeleton className="h-full w-full" />}
        {!isBuffer && emptyRoom && (
          <LoadingPanel numberOfUsers={peers.length} />
          // <div>NO BUDDYYYY HEREEEE</div>
        )}
        <div
          className={cn(
            "relative flex h-full w-full flex-col justify-between",
            {
              "max-h-[55vh]": roomState !== ROOMSTATE.CODE,
              hidden: emptyRoom,
            }
          )}
        >
          {/* todo(nickbar01234): Fix styling */}
          {!canViewCode && !isBuffer && (
            <button
              className="hover:bg-fill-quaternary dark:hover:bg-fill-quaternary text-label-1 dark:text-dark-label-1 absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg px-4 py-2 font-bold"
              onClick={unblur}
              type="button"
            >
              View
            </button>
          )}
          <div
            data-view-code={canViewCode}
            className={cn("h-full w-full", {
              blur: !canViewCode,
            })}
          >
            <ResizableBox
              height={codePreference.height}
              axis="y"
              resizeHandles={canViewCode ? ["s"] : undefined}
              className="relative flex h-full w-full"
              minConstraints={[Infinity, height * 0.2]}
              maxConstraints={[Infinity, height * 0.5]}
              handle={
                <div className="bg-layer-bg-gray dark:bg-layer-bg-gray absolute bottom-0 h-2 w-full">
                  <div className="flexlayout__splitter flexlayout__splitter_horz relative top-1/2 h-[2px] w-full -translate-y-1/2 cursor-ns-resize after:h-[2px] after:bg-[--color-splitter] hover:after:h-full hover:after:bg-[--color-splitter-drag]" />
                </div>
              }
              onResize={(_e, data) => setCodePreferenceHeight(data.size.height)}
              onResizeStop={onResizeStop}
            >
              {isBuffer && <Skeleton className="h-full w-full" />}
              <div
                className={cn(
                  "relative flex h-full w-full grow flex-col gap-y-2",
                  {
                    hidden: isBuffer,
                  }
                )}
              >
                <EditorToolBar />
                <div
                  id={EDITOR_NODE_ID}
                  className={cn("h-full w-full overflow-hidden")}
                />
              </div>
            </ResizableBox>
            <div
              className="relative w-full overflow-auto"
              style={{ height: height - codePreference.height - 128 }}
            >
              {isBuffer ? (
                <Skeleton className="h-full w-full bg-[--color-tabset-tabbar-background]" />
              ) : (
                <div className="mx-5 my-4 flex flex-col space-y-4">
                  <div className="flex w-full flex-row items-start justify-between gap-4">
                    <div className="hide-scrollbar flex flex-nowrap items-center gap-x-2 gap-y-4 overflow-x-scroll">
                      {activePeer?.tests.map((test, idx) => (
                        <div key={idx} onClick={() => selectTest(idx)}>
                          {test.selected ? (
                            <button className="bg-fill-3 dark:bg-dark-fill-3 hover:bg-fill-2 dark:hover:bg-dark-fill-2 hover:text-label-1 dark:hover:text-dark-label-1 text-label-1 dark:text-dark-label-1 relative inline-flex items-center whitespace-nowrap rounded-lg px-4 py-1 font-medium focus:outline-none">
                              Case {idx + 1}
                            </button>
                          ) : (
                            <button className="hover:bg-fill-2 dark:hover:bg-dark-fill-2 text-label-2 dark:text-dark-label-2 hover:text-label-1 dark:hover:text-dark-label-1 dark:bg-dark-transparent relative inline-flex items-center whitespace-nowrap rounded-lg bg-transparent px-4 py-1 font-medium focus:outline-none">
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
                            <div className="text-label-3 dark:text-dark-label-3 text-xs font-medium">
                              {assignment.variable} =
                            </div>
                            <div className="font-menlo bg-fill-3 dark:bg-dark-fill-3 w-full cursor-text rounded-lg border border-transparent px-3 py-[10px]">
                              <div
                                className="font-menlo placeholder:text-label-4 dark:placeholder:text-dark-label-4 sentry-unmask w-full resize-none whitespace-pre-wrap break-words outline-none"
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
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;
