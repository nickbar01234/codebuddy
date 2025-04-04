import UserDropdown from "@cb/components/navigator/dropdown/UserDropdown";
import CreateRoomLoadingPanel from "@cb/components/panel/editor/CreateRoomLoadingPanel";
import { CodeTab, TestTab } from "@cb/components/panel/editor/tab";
import { AppState, appStateContext } from "@cb/context/AppStateProvider";
import { LogEvent } from "@cb/db/converter";
import { usePeerSelection, useWindowDimensions } from "@cb/hooks/index";
import { Separator } from "@cb/lib/components/ui/separator";
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
import { ActivityLog } from "./activity/ActivityLog";
export interface TabMetadata {
  id: string;
  displayHeader: string;
}

export const EDITOR_NODE_ID = "CodeBuddyEditor";

const EditorPanel = () => {
  const { peers, activePeer, unblur, selectTest, isBuffer } =
    usePeerSelection();
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
    ],
    [activePeer, activeTest, selectTest]
  );

  const { state: appState } = React.useContext(appStateContext);

  return (
    <>
      {!isBuffer && emptyRoom && appState === AppState.ROOM && (
        <CreateRoomLoadingPanel />
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
            <Tabs
              defaultValue="code"
              className={cn("h-full w-full bg-inherit text-inherit")}
            >
              <TabsList
                className={cn(
                  "hide-scrollbar flex h-fit w-full justify-start gap-2 overflow-x-auto border-border-quaternary dark:border-border-quaternary border-b rounded-none bg-inherit text-inherit"
                )}
              >
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
                      <tab.Icon
                        className="mr-2 h-4 w-4 text-[#34C759]

"
                      />
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
                  className={cn(
                    "data-[state=inactive]:hidden hide-scrollbar overflow-auto"
                  )}
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
            <ActivityLog logEntries={logEntries} />
          </div>
        </div>
      </div>
    </>
  );
};

export default EditorPanel;

const logEntries: LogEvent[] = [
  {
    type: "submission",
    username: "Buddy",
    output: "Accepted",
    status: "success",
    timestamp: Date.now() - Math.floor(Math.random() * 10), // Random timestamp
  },
  {
    type: "submission",
    username: "Code",
    output: "Time limit exceeded",
    status: "error",
    timestamp: Date.now() - Math.floor(Math.random() * 4000), // Random timestamp
  },
  {
    type: "connection",
    username: "Dev",
    status: "join",
    timestamp: Date.now() - Math.floor(Math.random() * 110), // Random timestamp
  },
  {
    type: "message",
    username: "Code",
    message: "RAHHHhHHH can someone take a look at my code",
    timestamp: Date.now() - Math.floor(Math.random() * 3130), // Random timestamp
  },
  {
    type: "message",
    username: "Buddy",
    message: "um no sry",
    timestamp: Date.now() - Math.floor(Math.random() * 13470), // Random timestamp
  },
  {
    type: "connection",
    username: "Buddy",
    status: "leave",
    timestamp: Date.now() - Math.floor(Math.random() * 1220), // Random timestamp
  },
  {
    type: "message",
    username: "Code",
    message: "???",
    timestamp: Date.now() - Math.floor(Math.random() * 1234109), // Random timestamp
  },
  {
    type: "message",
    username: "Dev",
    message: "lmao",
    timestamp: Date.now() - Math.floor(Math.random() * 223410), // Random timestamp
  },
  {
    type: "message",
    username: "5bigBooms",
    message: "lmao",
    timestamp: Date.now() - Math.floor(Math.random() * 232410), // Random timestamp
  },
];
