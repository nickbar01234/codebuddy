import UserDropdown from "@cb/components/navigator/dropdown/UserDropdown";
import { LoadingPanel } from "@cb/components/panel/LoadingPanel";
import { AppState } from "@cb/context/AppStateProvider";
import {
  useAppState,
  usePeerSelection,
  useWindowDimensions,
} from "@cb/hooks/index";
import { Separator } from "@cb/lib/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@cb/lib/components/ui/tabs";
import { cn } from "@cb/utils/cn";
import { Activity, CodeXml, FlaskConical } from "lucide-react";
import React from "react";
import { ResizableBox } from "react-resizable";
import { ActivityLogTab } from "./tab/ActivityLogTab";
import CodeTab from "./tab/CodeTab";
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

  const tabsConfig = React.useMemo(
    () => [
      {
        value: "code",
        label: "Code",
        Icon: CodeXml,
        Content: <CodeTab />,
      },
      {
        value: "test",
        label: "Test",
        Icon: FlaskConical,
        Content: (
          <TestTab
            activePeer={activePeer}
            activeTest={activeTest}
            selectTest={selectTest}
          />
        ),
      },
      {
        value: "activity",
        label: "Activity",
        Icon: Activity,
        Content: (
          <ActivityLogTab
            logEntries={[
              {
                type: "accepted",
                message: "Buddy just submitted their code",
                status: "[Accepted]",
              },
              {
                type: "error",
                message: "Code just submitted their code",
                status: "[Time Limit Exceeded]",
              },
              { type: "join", message: "Dev just joined the room" },
              {
                type: "normal",
                message: "Code: RAHHHhHHH can someone take a look at my code",
              },
              { type: "normal", message: "Buddy: um no sry", italic: true },
              { type: "leave", message: "Buddy just left the room" },
              { type: "normal", message: "Code: ???" },
              { type: "normal", message: "Dev: lmao", italic: true },
              { type: "normal", message: "5bigBooms: lmao", italic: true },
            ]}
          />
        ),
      },
    ],
    [activePeer, activeTest, selectTest]
  );

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
                  key="user-dropdown"
                  isOpen={isUserDropdownOpen}
                  toggle={toggleUserDropdown}
                />

                <Separator
                  orientation="vertical"
                  className={
                    "flexlayout__tabset_tab_divider h-[1rem] bg-[--color-tabset-tabbar-background]"
                  }
                />

                {tabsConfig.map((tab, index) => (
                  <React.Fragment key={tab.value}>
                    <TabsTrigger
                      value={tab.value}
                      className={
                        "rounded-none border-transparent bg-transparent hover:rounded-sm hover:bg-[--color-tabset-tabbar-background] data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:bg-transparent"
                      }
                    >
                      <tab.Icon className="mr-2 h-4 w-4 text-green-500" />
                      {tab.label}
                    </TabsTrigger>
                    {index !== tabsConfig.length - 1 && (
                      <Separator
                        orientation="vertical"
                        className={
                          "flexlayout__tabset_tab_divider h-[1rem] bg-[--color-tabset-tabbar-background]"
                        }
                      />
                    )}
                  </React.Fragment>
                ))}
              </TabsList>

              {tabsConfig.map(({ value, Content }) => (
                <TabsContent
                  key={value}
                  value={value}
                  forceMount
                  className={cn("data-[state=inactive]:hidden")}
                >
                  {Content}
                </TabsContent>
              ))}
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
