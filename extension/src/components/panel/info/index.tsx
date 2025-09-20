import { FEATURE_FLAG } from "@cb/constants";
import { useRoomActions, useRoomData, useRoomStatus } from "@cb/hooks/store";
import { Sheet, SheetContent } from "@cb/lib/components/ui/sheet";
import { RoomStatus, SidebarTabIdentifier } from "@cb/store";
import { Info, List } from "lucide-react";
import { createPortal } from "react-dom";
import { GeneralRoomInfo } from "./GeneralRoomInfo";
import { ProblemInfo } from "./ProblemInfo";
import { SidebarTabTrigger } from "./SidebarTabTrigger";

export const RoomInfo = () => {
  const roomStatus = useRoomStatus();
  const { activeSidebarTab } = useRoomData();
  const { closeSidebarTab } = useRoomActions();

  return createPortal(
    <div
      className={cn(
        "bg-secondary border-2 rounded-tl-lg rounded-bl-lg absolute right-0 top-[256px] translate-x-2 z-[1000] border-border-button shadow-lg",
        {
          hidden:
            roomStatus !== RoomStatus.IN_ROOM ||
            FEATURE_FLAG.DISABLE_MULTI_URLS,
        }
      )}
    >
      <Sheet
        open={activeSidebarTab != undefined}
        onOpenChange={(open) => {
          if (!open) closeSidebarTab();
        }}
      >
        <div className="flex flex-col gap-y-2 p-2">
          <SidebarTabTrigger
            forTab={SidebarTabIdentifier.ROOM_INFO}
            trigger={<Info />}
          />
          <SidebarTabTrigger
            forTab={SidebarTabIdentifier.ROOM_QUESTIONS}
            trigger={<List />}
          />
        </div>
        <SheetContent
          className={cn(
            "bg-secondary z-[2000] [&>button:first-of-type]:hidden w-5/12"
          )}
        >
          <GeneralRoomInfo />
          <ProblemInfo />
        </SheetContent>
      </Sheet>
    </div>,
    document.body
  );
};
