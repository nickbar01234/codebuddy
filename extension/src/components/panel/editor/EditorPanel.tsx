import UserDropdown from "@cb/components/navigator/dropdown/UserDropdown";
import { LoadingPanel } from "@cb/components/panel/LoadingPanel";
import { AppState } from "@cb/context/AppStateProvider";
import {
  useAppState,
  usePeerSelection,
  useWindowDimensions,
} from "@cb/hooks/index";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@cb/lib/components/ui/tabs";
import { cn } from "@cb/utils/cn";
import { CodeXml, FlaskConical } from "lucide-react";
import React from "react";
import { ResizableBox } from "react-resizable";
import EditorToolBar from "./EditorToolBar";
import { Separator } from "@cb/lib/components/ui/separator";
import { TestTab } from "./tab/TestTab";

export interface TabMetadata {
  id: string;
  displayHeader: string;
}

export const EDITOR_NODE_ID = "CodeBuddyEditor";

const EditorPanel = () => {
  const { peers, activePeer, unblur, selectTest, isBuffer } =
    usePeerSelection();
  const { state: appState } = useAppState();
  const {
    setCodePreferenceHeight,
    onResizeStop,
    preference: { codePreference },
    height,
  } = useWindowDimensions();
  const [isUserDropdownOpen, setUserDropdownOpen] = React.useState(false);
  const toggleUserDropdown = React.useCallback(
    (e: React.MouseEvent<Element, MouseEvent>) => {
      e.stopPropagation();
      setUserDropdownOpen((prev) => !prev);
    },
    []
  );

  const canViewCode = activePeer?.viewable ?? false;
  const activeTest = activePeer?.tests.find((test) => test.selected);
  const emptyRoom = peers.length === 0;

  return (
    <>
      {!isBuffer && emptyRoom && appState === AppState.ROOM && (
        <LoadingPanel numberOfUsers={peers.length} />
      )}
      <div
        className={cn("relative flex h-full w-full flex-col justify-between", {
          hidden: emptyRoom,
        })}
      >
        {/* todo(nickbar01234): Fix styling */}
        {!canViewCode && (
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
            <Tabs defaultValue="code" className="h-full w-full">
              <TabsList className="flex w-full justify-start gap-2">
                <UserDropdown
                  key={"user-dropdown"}
                  isOpen={isUserDropdownOpen}
                  toggle={toggleUserDropdown}
                />

                <Separator
                  orientation="vertical"
                  className="flexlayout__tabset_tab_divider h-[1rem] bg-[--color-tabset-tabbar-background]"
                />
                <TabsTrigger
                  value="code"
                  className="rounded-none border-transparent bg-transparent hover:rounded-t-sm hover:bg-[--color-tabset-tabbar-background] data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:bg-transparent"
                >
                  <CodeXml className="mr-2 h-4 w-4 text-green-500" />
                  Code
                </TabsTrigger>
                <Separator
                  orientation="vertical"
                  className="flexlayout__tabset_tab_divider h-[1rem] bg-[--color-tabset-tabbar-background]"
                />
                <TabsTrigger
                  value="test"
                  className="rounded-none border-transparent bg-transparent hover:rounded-t-sm hover:bg-[--color-tabset-tabbar-background] data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:bg-transparent"
                >
                  <FlaskConical className="mr-2 h-4 w-4 text-green-500" />
                  Test
                </TabsTrigger>
              </TabsList>
              <TabsContent
                value="code"
                forceMount
                className={cn("data-[state=inactive]:hidden")}
              >
                <div className="h-full w-full">
                  <EditorToolBar />
                  <div
                    id={EDITOR_NODE_ID}
                    className="h-full min-h-[50vh] w-full overflow-hidden"
                  />
                </div>
              </TabsContent>
              <TabsContent
                value="test"
                forceMount
                className={cn("data-[state=inactive]:hidden")}
              >
                <TestTab
                  activePeer={activePeer}
                  activeTest={activeTest}
                  selectTest={selectTest}
                />
              </TabsContent>
            </Tabs>
          </ResizableBox>
          <div
            className="relative w-full overflow-auto"
            style={{ height: height - codePreference.height - 128 }}
          >
            <div className="h-full w-full bg-black">THIS IS ACTIVITY LOG</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditorPanel;
