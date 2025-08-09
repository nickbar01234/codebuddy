import { AppStatus, RoomState, RoomStatus, roomStore, useApp } from "@cb/store";
import { useStore } from "zustand";
import { useShallow } from "zustand/shallow";

export const useAuthUser = () => {
  const auth = useApp((state) => state.auth);
  if (auth.status !== AppStatus.AUTHENTICATED) {
    throw new Error(
      "useAuthUser when status is not authenticated. This is most likely a program bug."
    );
  }
  return { user: auth.user };
};

// todo(nickbar01234): Small hack around since we ideally want to throw here
const DEFAULT_ROOM: Extract<RoomState["room"], { status: RoomStatus.IN_ROOM }> =
  {
    peers: {},
  } as any;

export const useInRoom = () => {
  return useStore(
    roomStore,
    useShallow((state) => {
      const room = state.room;
      if (room.status !== RoomStatus.IN_ROOM) {
        return DEFAULT_ROOM;
      }
      const { status, ...rest } = room;
      return rest;
    })
  );
};
