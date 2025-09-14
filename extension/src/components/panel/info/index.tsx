import { FEATURE_FLAG } from "@cb/constants";
import { useRoomStatus } from "@cb/hooks/store";
import { RoomStatus } from "@cb/store";
import { createPortal } from "react-dom";
import { GeneralRoomInfo } from "./GeneralRoomInfo";
import { ProblemInfo } from "./ProblemInfo";

export const RoomInfo = () => {
  const roomStatus = useRoomStatus();

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
      <div className="flex flex-col gap-y-2 p-2">
        <GeneralRoomInfo />
        <ProblemInfo />
      </div>
    </div>,
    document.body
  );
};
