import { UserDropDownMenu } from "@cb/components/navigator/menu/UserDropDownMenu";
import CreateRoomLoadingPanel from "@cb/components/panel/editor/CreateRoomLoadingPanel";
import { CodeTab, TestTab } from "@cb/components/panel/editor/tab";
import { Tooltip } from "@cb/components/tooltip";
import { SkeletonWrapper } from "@cb/components/ui/SkeletonWrapper";
import { useCopyCode } from "@cb/hooks/editor";
import {
  useLeetCodeActions,
  usePeerActions,
  usePeers,
  useRoomData,
  useRoomStatus,
} from "@cb/hooks/store";
import {
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
import { RoomStatus } from "@cb/store";
import { cn } from "@cb/utils/cn";
import { CodeXml, Copy, Eye, EyeOff, FlaskConical } from "lucide-react";
import React from "react";

const EditorPanel = () => {
  const { selectedPeer, peers } = usePeers();
  const { self } = useRoomData();
  const roomStatus = useRoomStatus();
  const { selectTest, toggleCodeVisibility } = usePeerActions();
  const { getLanguageExtension } = useLeetCodeActions();
  const copyCode = useCopyCode();

  const url = self?.url ?? "";
  const activeTest = selectedPeer?.questions[url]?.tests.find(
    (test) => test.selected
  );
  const emptyRoom = Object.keys(peers).length === 0;

  const upperTabConfigs = React.useMemo(() => {
    const extension =
      getLanguageExtension(selectedPeer?.questions[url]?.code?.language) ?? "";
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
            activePeer={selectedPeer}
            activeTest={activeTest}
            selectTest={selectTest}
          />
        ),
      },
    ];
  }, [selectedPeer, activeTest, selectTest, getLanguageExtension, url]);

  const hideCode = !selectedPeer?.questions[self?.url ?? ""]?.viewable;

  return (
    <div
      className={cn(
        "relative flex h-full w-full grow flex-col gap-y-2 bg-base overflow-hidden",
        {
          hidden: roomStatus !== RoomStatus.IN_ROOM,
        }
      )}
    >
      {emptyRoom && (
        <SkeletonWrapper loading={false}>
          <CreateRoomLoadingPanel />
        </SkeletonWrapper>
      )}
      <div className={cn("h-full w-full", { hidden: emptyRoom })}>
        <ResizablePanelGroup
          direction="vertical"
          className="relative h-full w-full"
        >
          <ResizablePanel
            defaultSize={60}
            minSize={30}
            maxSize={80}
            className="relative rounded-b-lg bg-secondary"
          >
            <Tabs
              defaultValue="code"
              className="h-full w-full bg-inherit text-inherit"
            >
              <div className="flex justify-between w-full border-border-quaternary dark:border-border-quaternary border-b rounded-none px-2 py-1 items-center">
                <TabsList className="hide-scrollbar bg-secondary flex h-fit w-full justify-start gap-2 overflow-x-auto text-inherit">
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
                          "rounded-none border-transparent bg-transparent hover:rounded-sm hover:bg-[--color-tabset-tabbar-background] data-[state=active]:border-b-2 data-[state=active]:border-orange-500 data-[state=active]:bg-transparent"
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
                <div className="flex gap-2">
                  <Tooltip
                    trigger={{
                      node: (
                        <div
                          className="h-fit hover:bg-fill-quaternary dark:hover:bg-fill-quaternary inline-flex items-center justify-between focus:outline-none p-2 rounded-md cursor-pointer"
                          onClick={toggleCodeVisibility}
                        >
                          {hideCode ? <Eye size={16} /> : <EyeOff size={16} />}
                        </div>
                      ),
                    }}
                    content={hideCode ? "View code" : "Hide code"}
                  />
                  <Tooltip
                    trigger={{
                      node: (
                        <div
                          className="h-fit hover:bg-fill-quaternary dark:hover:bg-fill-quaternary inline-flex items-center justify-between focus:outline-none p-2 rounded-md cursor-pointer"
                          onClick={copyCode}
                        >
                          <Copy size={16} />
                        </div>
                      ),
                    }}
                    content="Copy code"
                  />
                </div>
              </div>
              {upperTabConfigs.map(({ value, Content }) => (
                <TabsContent
                  key={value}
                  value={value}
                  forceMount
                  className={cn(
                    "data-[state=inactive]:hidden hide-scrollbar overflow-auto h-full oveflow-y-hidden w-full mt-0",
                    {
                      "blur pointer-events-none": hideCode,
                    }
                  )}
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
