import { FEATURE_FLAG } from "@cb/constants";
import { useRoomSelectedSidebarTab, useRoomStatus } from "@cb/hooks/store";
import { RoomStatus } from "@cb/store";
import { createPortal } from "react-dom";
import { GeneralRoomInfo } from "./GeneralRoomInfo";
import { ProblemInfo } from "./ProblemInfo";

export const RoomInfo = () => {
  const roomStatus = useRoomStatus();
  const activeSidebarTab = useRoomSelectedSidebarTab();

  return createPortal(
    <div
      className={cn(
        "bg-secondary border-2 rounded-tl-lg rounded-bl-lg absolute top-[256px] translate-x-2 z-[1000] border-border-button shadow-lg",
        {
          "right-0": activeSidebarTab == undefined,
          "right-1/2 transition ease-in-out duration-500 slide-in-from-right animate-in":
            activeSidebarTab != undefined,
          hidden:
            roomStatus !== RoomStatus.IN_ROOM ||
            FEATURE_FLAG.DISABLE_MULTI_URLS,
        }
      )}
    >
      <div className="flex flex-col gap-y-2 p-2">
        <GeneralRoomInfo />
        <ProblemInfo />
      </div>
    </div>,
    document.body
  );
};
