import { updateUserHeartbeat } from "@cb/db";
import { RoomUser } from "@cb/db/converter";
import { useAppState, useOnMount, useRTC } from "@cb/hooks";
import React from "react";

export const HEARTBEAT_INTERVAL = 15000; // ms
// const CHECK_ALIVE_INTERVAL = 15000; // ms
// const TIMEOUT = 100; // seconds;

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
  const roomUsers: Record<string, RoomUser> = {};
  const { roomId } = useRTC();

  const roomIdRef = React.useRef(roomId);

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

  // React.useEffect(() => {
  //   if (roomId != null) {
  //     // const currentPeers = getConnection();

  //     const unsubscribe = onSnapshot(
  //       getRoomUserRefs(roomId),
  //       async (snapshot) => {
  //         const data = snapshot.docs;
  //       }
  //     );
  //   }
  // });

  return (
    <HeartBeatContext.Provider value={{ roomUsers }}>
      {props.children}
    </HeartBeatContext.Provider>
  );
};
