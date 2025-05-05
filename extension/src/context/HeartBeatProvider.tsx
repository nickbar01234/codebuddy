import { getRoomUserRefs, updateUserHeartbeat } from "@cb/db";
import { RoomUser } from "@cb/db/converter";
import { useAppState, useOnMount, useRTC } from "@cb/hooks";
import { getUnixTs } from "@cb/utils/heartbeat";
import { onSnapshot } from "firebase/firestore";
import React from "react";

export const HEARTBEAT_INTERVAL = 15000;
const CHECK_ALIVE_INTERVAL = 15000; // ms
const TIMEOUT = 100; // seconds;

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
  const { roomId, deletePeers } = useRTC();
  const roomIdRef = React.useRef(roomId);
  const [roomUsers, setRoomUsers] = React.useState<Record<string, RoomUser>>(
    {}
  );

  React.useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  const deletePeersRef = React.useRef(deletePeers);

  useOnMount(() => {
    const updateHeartBeat = () => {
      if (roomIdRef.current) {
        updateUserHeartbeat(roomIdRef.current, username)
          .then(() => console.log("Heartbeat updated successfully"))
          .catch((error) => console.error("Error updating heartbeat:", error));
      }
    };

    const sendInterval = setInterval(updateHeartBeat, HEARTBEAT_INTERVAL);

    const checkAliveInterval = setInterval(() => {
      const timeOutPeers: string[] = [];

      setRoomUsers((prev) => {
        const newRoomUsers: Record<string, RoomUser> = Object.fromEntries(
          Object.entries(prev).map(([peer, { lastHeartBeat }]) => {
            const newSample = getUnixTs() - lastHeartBeat.seconds;
            if (newSample > TIMEOUT && peer != username) {
              timeOutPeers.push(peer);
              return [];
            }
            return [peer, { lastHeartBeat }];
          })
        );
        if (timeOutPeers.length > 0) {
          deletePeersRef.current(timeOutPeers);
        }
        return newRoomUsers;
      });
    }, CHECK_ALIVE_INTERVAL);

    return () => {
      clearInterval(sendInterval);
      clearInterval(checkAliveInterval);
    };
  });

  React.useEffect(() => {
    if (!roomIdRef.current) {
      return;
    }

    const unsubscribe = onSnapshot(
      getRoomUserRefs(roomIdRef.current),
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
