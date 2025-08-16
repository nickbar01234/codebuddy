import { UserDropDownMenu } from "@cb/components/navigator/menu/UserDropDownMenu";
import CreateRoomLoadingPanel from "@cb/components/panel/editor/CreateRoomLoadingPanel";
import { CodeTab, TestTab } from "@cb/components/panel/editor/tab";
import { ActivityLogTab } from "@cb/components/panel/editor/tab/activity/ActivityLogTab";
import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { getRoomRef } from "@cb/db";
import { RoomEvent } from "@cb/db/converter";
import { useFirebaseListener } from "@cb/hooks";
import { useAuthUser } from "@cb/hooks/store";
import useLanguageExtension from "@cb/hooks/useLanguageExtension";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@cb/lib/components/ui/resizable";
import { Separator } from "@cb/lib/components/ui/separator";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@cb/lib/components/ui/tabs";
import { RoomStatus, useRoom } from "@cb/store";
import { cn } from "@cb/utils/cn";
import { Activity, CodeXml, FlaskConical, Info } from "lucide-react";
import React from "react";
import { useShallow } from "zustand/shallow";

export interface TabMetadata {
  id: string;
  displayHeader: string;
}

const EditorPanel = () => {
  const activePeer = useRoom(
    useShallow((state) => getSelectedPeer(state.peers))
  );
  const roomStatus = useRoom((state) => state.status);
  const roomId = useRoom((state) => state.room?.id);
  const selectTest = useRoom((state) => state.actions.peers.selectTest);
  const { user } = useAuthUser();
  const { getLanguageExtension } = useLanguageExtension();
  const roomReference = React.useMemo(
    () => (roomId != undefined ? getRoomRef(roomId) : undefined),
    [roomId]
  );
  const { data: roomInfo } = useFirebaseListener({
    reference: roomReference,
    // todo(nickbar01234): Port to redux
    init: { usernames: [], isPublic: true, roomName: "" },
  });

  // const canViewCode = codeViewable(activePeer);
  const canViewCode = true;
  const activeTest = activePeer?.tests.find((test) => test.selected);
  const emptyRoom =
    roomInfo.usernames.filter((username) => username !== user.username)
      .length === 0;

  const upperTabConfigs = React.useMemo(() => {
    const extension =
      getLanguageExtension(activePeer?.code?.code.language) ?? "";
    return [
      {
        value: "code",
        label: `Code${extension}`,
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
    ];
  }, [activePeer, activeTest, selectTest, getLanguageExtension]);

  const lowerTabConfigs = React.useMemo(() => {
    return [
      {
        value: "activity",
        label: "Activity Log",
        Icon: Activity,
        Content: <ActivityLogTab roomEvents={roomEvents} />,
      },
      {
        value: "roomInfo",
        label: "Room Info",
        Icon: Info,
        Content: null,
        // Content: <RoomInfoTab />,
      },
    ];
  }, []);

  return (
    <div
      className={cn("relative flex h-full w-full grow flex-col gap-y-2", {
        hidden: roomStatus !== RoomStatus.IN_ROOM,
      })}
    >
      {emptyRoom && (
        <SkeletonWrapper loading={false}>
          <CreateRoomLoadingPanel />
        </SkeletonWrapper>
      )}
      <div className={cn("h-full w-full", { hidden: emptyRoom })}>
        <ResizablePanelGroup
          direction="vertical"
          className={cn("relative h-full w-full")}
        >
          <ResizablePanel
            defaultSize={60}
            minSize={30}
            maxSize={80}
            className="relative"
          >
            {/* todo(nickbar01234): Fix styling */}
            {!canViewCode && (
              <button
                className="hover:bg-fill-quaternary dark:hover:bg-fill-quaternary text-label-1 dark:text-dark-label-1 absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-lg px-4 py-2 font-bold"
                // onClick={unblur}
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
              <Tabs
                defaultValue="code"
                className="h-full w-full bg-inherit text-inherit"
              >
                <TabsList className="hide-scrollbar bg-secondary flex h-fit w-full justify-start gap-2 overflow-x-auto border-border-quaternary dark:border-border-quaternary border-b rounded-none text-inherit">
                  <UserDropDownMenu />
                  <Separator
                    orientation="vertical"
                    className="flexlayout__tabset_tab_divider h-[1rem] bg-[--color-tabset-tabbar-background]"
                  />
                  {upperTabConfigs.map((tab, index) => (
                    <React.Fragment key={tab.value}>
                      <TabsTrigger
                        value={tab.value}
                        className={cn(
                          "rounded-none border-transparent bg-transparent hover:rounded-sm hover:bg-[--color-tabset-tabbar-background] data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:bg-transparent",
                          {
                            "pointer-events-none": !canViewCode,
                          }
                        )}
                      >
                        <tab.Icon className="mr-2 h-4 w-4 text-[#34C759]" />
                        {tab.label}
                      </TabsTrigger>
                      {index !== upperTabConfigs.length - 1 && (
                        <Separator
                          orientation="vertical"
                          className="flexlayout__tabset_tab_divider h-[1rem] bg-[--color-tabset-tabbar-background]"
                        />
                      )}
                    </React.Fragment>
                  ))}
                </TabsList>
                {upperTabConfigs.map(({ value, Content }) => (
                  <TabsContent
                    key={value}
                    value={value}
                    forceMount
                    className="data-[state=inactive]:hidden hide-scrollbar overflow-auto h-full w-full mt-0"
                  >
                    {Content}
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </ResizablePanel>
          <div className="h-[8px] bg-base w-full">
            <ResizableHandle className="flexlayout__splitter flexlayout__splitter_horz h-2 w-full cursor-ns-resize after:w-[20px] after:bg-[--color-splitter] hover:after:w-full hover:after:bg-[--color-splitter-drag]" />
          </div>
          <ResizablePanel>
            <Tabs
              defaultValue="activity"
              className="h-full w-full bg-secondary text-inherit"
            >
              <TabsList className="hide-scrollbar bg-inherit flex  h-fit w-full justify-start gap-2 overflow-x-auto border-border-quaternary dark:border-border-quaternary border-b rounded-none text-inherit">
                {lowerTabConfigs.map((tab, index) => (
                  <React.Fragment key={tab.value}>
                    <TabsTrigger
                      value={tab.value}
                      className="rounded-none border-transparent bg-transparent hover:rounded-sm hover:bg-[--color-tabset-tabbar-background] data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:bg-transparent"
                    >
                      <tab.Icon className="mr-2 h-4 w-4 text-[#34C759]" />
                      {tab.label}
                    </TabsTrigger>
                    {index !== lowerTabConfigs.length - 1 && (
                      <Separator
                        orientation="vertical"
                        className="flexlayout__tabset_tab_divider h-[1rem] bg-[--color-tabset-tabbar-background]"
                      />
                    )}
                  </React.Fragment>
                ))}
              </TabsList>
              {lowerTabConfigs.map(({ value, Content }) => (
                <TabsContent
                  key={value}
                  value={value}
                  forceMount
                  className="data-[state=inactive]:hidden hide-scrollbar overflow-auto h-full w-full mt-0"
                >
                  {Content}
                </TabsContent>
              ))}
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export default EditorPanel;

const roomEvents: RoomEvent[] = [
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
