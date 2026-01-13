import { DEV_ROOM } from "@cb/constants";
import db from "@cb/services/db";
import { AppStatus, RoomStatus, useApp, useRoom } from "@cb/store";
import { getSessionStorage, setSessionStorage } from "@cb/utils";
import { useEffect } from "react";

export const useDev = () => {
  const authStatus = useApp((s) => s.auth.status);
  const roomStatus = useRoom((s) => s.status);

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const hasAttempted = getSessionStorage("devAutoJoinAttempted") === true;

    // First load: reload page to ensure content scripts are injected
    if (!hasAttempted) {
      setSessionStorage("devAutoJoinAttempted", true);
      console.log("[DEV] Reloading page for content script injection...");
      window.location.reload();
      return;
    }

    // Second load: proceed with auto-join
    if (
      authStatus !== AppStatus.AUTHENTICATED ||
      roomStatus !== RoomStatus.HOME
    )
      return;

    const autoJoin = async () => {
      const roomActions = useRoom.getState().actions.room;

      const existingRoom = await db.room.get(DEV_ROOM.ID);

      if (existingRoom) {
        await roomActions.join(DEV_ROOM.ID);
      } else {
        await roomActions.create(
          { name: DEV_ROOM.NAME, isPublic: false },
          DEV_ROOM.ID
        );
      }
    };
    autoJoin();
  }, [authStatus, roomStatus]);
};
