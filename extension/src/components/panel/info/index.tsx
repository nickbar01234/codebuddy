import { DOM } from "@cb/constants";
import { useRoomActions, useRoomData, useRoomStatus } from "@cb/hooks/store";
import { Sheet, SheetContent } from "@cb/lib/components/ui/sheet";
import { RoomStatus, SidebarTabIdentifier } from "@cb/store";
import { Info, List, ListPlus } from "lucide-react";
import React from "react";
import { createPortal } from "react-dom";
import { GeneralRoomInfo } from "./GeneralRoomInfo";
import { LeetCodeQuestions } from "./LeetCodeQuestions";
import { ProblemInfo } from "./ProblemInfo";
import { SidebarTabTrigger } from "./SidebarTabTrigger";

const TRIGGERS = [
  {
    identifier: SidebarTabIdentifier.ROOM_INFO,
    icon: <Info />,
  },
  {
    identifier: SidebarTabIdentifier.ROOM_QUESTIONS,
    icon: <List />,
  },
  {
    identifier: SidebarTabIdentifier.LEETCODE_QUESTIONS,
    icon: <ListPlus />,
  },
];

export const RoomInfo = () => {
  const roomStatus = useRoomStatus();
  const { activeSidebarTab } = useRoomData();
  const { closeSidebarTab } = useRoomActions();
  const sidebarRef = React.useRef<Element | null>(null);

  useOnMount(() => {
    waitForElement(`#${DOM.CODEBUDDY_SIDEBAR_ID}`)
      .then((element) => {
        sidebarRef.current = element;
      })
      .catch((error) => {
        console.log(
          `DOM ${DOM.CODEBUDDY_SIDEBAR_ID} not found. This is most likely a bug`,
          error
        );
      });
  });

  if (sidebarRef.current == null) {
    return null;
  }

  return createPortal(
    <>
      <div
        className={cn(
          "border-2 rounded-tl-lg rounded-bl-lg absolute top-[256px] translate-x-2 z-[1000] border-border-button shadow-lg transition-all pointer-events-auto",
          {
            "right-0 animate-out bg-secondary": activeSidebarTab == undefined,
            "right-1/2 animate-in bg-primary": activeSidebarTab != undefined,
            hidden: roomStatus !== RoomStatus.IN_ROOM,
          }
        )}
      >
        <Sheet open={activeSidebarTab != undefined}>
          <div className="flex flex-col gap-y-2 p-2">
            {TRIGGERS.map(({ identifier, icon }) => (
              <SidebarTabTrigger
                key={identifier}
                forTab={identifier}
                trigger={icon}
              />
            ))}
          </div>
          <SheetContent
            className={cn(
              "bg-primary z-[2000] [&>button:first-of-type]:hidden w-6/12"
            )}
            forceMount
            overlay={{
              onClick: () => closeSidebarTab(),
            }}
          >
            <GeneralRoomInfo />
            <ProblemInfo />
            <LeetCodeQuestions />
          </SheetContent>
        </Sheet>
      </div>
    </>,
    sidebarRef.current
  );
};
