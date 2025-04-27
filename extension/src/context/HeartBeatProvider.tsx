import { getRoomUserRefs, updateUserHeartbeat } from "@cb/db";
import { RoomUser } from "@cb/db/converter";
import { useAppState, useOnMount, useRTC } from "@cb/hooks";
import { onSnapshot } from "firebase/firestore";
import React from "react";
import { HEARTBEAT_INTERVAL } from "./RTCProvider";

interface HeartBeatProviderProps {
  children: React.ReactNode;
}
interface HeartBeatContext {
  roomUsers: Record<string, RoomUser>;
}

export const HeartBeatContext = React.createContext({} as HeartBeatContext);

export const HeartBeatProvider = (props: HeartBeatProviderProps) => {
  const {
    user: { username },
  } = useAppState();
  const { roomId } = useRTC();
  const roomIdRef = React.useRef(roomId);
  const [roomUsers, setRoomUsers] = React.useState<Record<string, RoomUser>>(
    {}
  );

  React.useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  useOnMount(() => {
    const updateHeartBeat = () => {
      if (roomIdRef.current) {
        updateUserHeartbeat(roomIdRef.current, username)
          .then(() => console.log("Heartbeat updated successfully"))
          .catch((error) => console.error("Error updating heartbeat:", error));
      }
    };

    const sendInterval = setInterval(updateHeartBeat, HEARTBEAT_INTERVAL);

    return () => {
      clearInterval(sendInterval);
    };
  });

  React.useEffect(() => {
    if (!roomId) {
      return;
    }

    const unsubscribe = onSnapshot(
      getRoomUserRefs(roomId),
      (snapshot) => {
        const updatedRoomUsers: Record<string, RoomUser> = {};
        snapshot.forEach((doc) => {
          updatedRoomUsers[doc.id] = { ...doc.data() } as RoomUser;
        });
        setRoomUsers(updatedRoomUsers);
      },
      (err) => {
        console.error("Error subscribing to room users:", err);
      }
    );

    return () => unsubscribe();
  }, [roomId]);

  return (
    <HeartBeatContext.Provider value={{ roomUsers }}>
      {props.children}
    </HeartBeatContext.Provider>
  );
};
