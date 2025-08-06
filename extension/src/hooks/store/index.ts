import { AppStatus, RoomStatus, roomStore, useApp } from "@cb/store";
import React from "react";
import { useStore } from "zustand";

export const useAuthUser = () => {
  const auth = useApp((state) => state.auth);
  if (auth.status !== AppStatus.AUTHENTICATED) {
    throw new Error(
      "useAuthUser when status is not authenticated. This is most likely a program bug."
    );
  }
  return { user: auth.user };
};

export const useInRoom = () => {
  const room = useStore(roomStore, (state) => state.room);
  // todo(nickbar01234): Small hack around since we ideally want to throw here
  const defaultRoom = React.useMemo(
    () =>
      ({
        peers: {},
      }) as any,
    []
  );
  if (room.status !== RoomStatus.IN_ROOM) {
    return defaultRoom;
  }
  const { status: _, ...rest } = room;
  return rest;
};
