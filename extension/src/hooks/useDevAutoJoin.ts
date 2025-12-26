import { DEV_ROOM } from "@cb/constants";
import db from "@cb/services/db";
import { AppStatus, RoomStatus, useApp, useRoom } from "@cb/store";
import { getSessionStorage, setSessionStorage } from "@cb/utils";
import { useEffect } from "react";

export const useDevAutoJoin = () => {
  const authStatus = useApp((s) => s.auth.status);
  const roomStatus = useRoom((s) => s.status);

  useEffect(() => {
    const hasAttempted = getSessionStorage("devAutoJoinAttempted") === true;

    if (
      !import.meta.env.DEV ||
      hasAttempted ||
      authStatus !== AppStatus.AUTHENTICATED ||
      roomStatus !== RoomStatus.HOME
    )
      return;

    setSessionStorage("devAutoJoinAttempted", true);

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
