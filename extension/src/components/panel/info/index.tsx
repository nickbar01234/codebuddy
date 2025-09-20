import { useRoomActions, useRoomData, useRoomStatus } from "@cb/hooks/store";
import { Sheet, SheetContent } from "@cb/lib/components/ui/sheet";
import { RoomStatus, SidebarTabIdentifier } from "@cb/store";
import { useHtml } from "@cb/store/htmlStore";
import { Info, List, ListPlus } from "lucide-react";
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
  const { hideHtml } = useHtml((state) => state.actions);

  return createPortal(
    <div
      className={cn(
        "bg-secondary border-2 rounded-tl-lg rounded-bl-lg absolute right-0 top-[256px] translate-x-2 z-[1000] border-border-button shadow-lg",
        {
          hidden: roomStatus !== RoomStatus.IN_ROOM,
        }
      )}
    >
      <Sheet
        open={activeSidebarTab != undefined}
        onOpenChange={(open) => {
          if (!open) {
            closeSidebarTab();
            hideHtml();
          }
        }}
      >
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
            "bg-primary z-[2000] [&>button:first-of-type]:hidden w-5/12"
          )}
          forceMount
        >
          <GeneralRoomInfo />
          <ProblemInfo />
          <LeetCodeQuestions />
        </SheetContent>
      </Sheet>
    </div>,
    document.body
  );
};
