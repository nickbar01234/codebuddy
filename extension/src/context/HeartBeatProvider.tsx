import {
  firestore,
  getRoomRef,
  getRoomUserRef,
  getRoomUserRefs,
  getSessionPeerConnectionRef,
  getSessionRef,
  updateUserHeartbeat,
} from "@cb/db";
import { RoomUser } from "@cb/db/converter";
import { useAppState, useOnMount, useRTC } from "@cb/hooks";
import useResource from "@cb/hooks/useResource";
import { Connection } from "@cb/types/utils";
import { getUnixTs } from "@cb/utils/heartbeat";
import { getQuestionIdFromUrl } from "@cb/utils/url";
import { arrayRemove, onSnapshot, writeBatch } from "firebase/firestore";
import React from "react";
import { HEARTBEAT_INTERVAL } from "./RTCProvider";

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
  const { roomId, informations, setInformations } = useRTC();
  const sessionId = React.useMemo(
    () => getQuestionIdFromUrl(window.location.href),
    []
  );
  const roomIdRef = React.useRef(roomId);
  const [roomUsers, setRoomUsers] = React.useState<Record<string, RoomUser>>(
    {}
  );
  const { evict: evictConnection } = useResource<Connection>({});

  React.useEffect(() => {
    roomIdRef.current = roomId;
  }, [roomId]);

  const deletePeers = React.useCallback(
    async (peers: string[]) => {
      if (peers.length === 0 || roomIdRef.current == null) return;

      peers.forEach(evictConnection);

      const batch = writeBatch(firestore);

      peers.forEach((peer) => {
        batch.delete(
          getSessionPeerConnectionRef(
            roomIdRef.current!,
            sessionId,
            username,
            peer
          )
        );
        batch.delete(getRoomUserRef(roomIdRef.current!, peer));
      });

      batch.update(getSessionRef(roomIdRef.current, sessionId), {
        usernames: arrayRemove(...peers),
      });
      // TODO: Remove user from every other possible sessions as well
      batch.update(getRoomRef(roomIdRef.current), {
        usernames: arrayRemove(...peers),
      });

      try {
        await batch.commit();
        console.log(`Successfully removed ${peers.length} peers from database`);

        setInformations(
          Object.fromEntries(
            Object.entries(informations).filter(([key]) => !peers.includes(key))
          )
        );
      } catch (error) {
        console.error("Error removing peers:", error);
      }

      setRoomUsers((prev) =>
        Object.fromEntries(
          Object.entries(prev).filter(([key]) => !peers.includes(key))
        )
      );
    },
    [evictConnection, informations, sessionId, setInformations, username]
  );

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
