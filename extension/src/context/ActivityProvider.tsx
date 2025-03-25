import { addEventToRoom, getRoomRef } from "@cb/db";
import { useResource } from "@cb/hooks/useResource";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  Unsubscribe,
} from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { LogEvent, logEventConverter } from "../db/converter";
import { useRTC } from "../hooks";

interface ActivityContextProps {
  children?: React.ReactNode;
}

type Activity = LogEvent & {
  id: string;
};

interface ActivityContext {
  activities: Activity[];
  sendActivity: (activity: Omit<LogEvent, "timestamp">) => void;
}

export const ActivityContext = createContext({} as ActivityContext);

export const ActivityProvider = (props: ActivityContextProps) => {
  const [activities, setActivities] = useState<Activity[]>([] as Activity[]);
  const { roomId } = useRTC();
  const { register: registerSnapshot } = useResource<Unsubscribe>({
    name: "snapshot",
  });

  const sendActivity = (activity: Omit<LogEvent, "timestamp">) => {
    if (!roomId) return;
    addEventToRoom(activity, roomId);
  };
  useEffect(() => {
    if (!roomId) return;
    const q = query(
      collection(getRoomRef(roomId), "logs"),
      orderBy("timestamp", "desc")
    ).withConverter(logEventConverter);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      if (
        querySnapshot.docs.some(
          (doc) => !(doc.data().timestamp instanceof Timestamp)
        )
      ) {
        return;
      }
      console.log("hi");
      const fetchedActivities = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp,
      }));
      registerSnapshot("activity", unsubscribe, (prev) => prev());

      setActivities(fetchedActivities.reverse()); // Ensure oldest first
    });
    return () => unsubscribe();
  }, [roomId, registerSnapshot]);

  return (
    <ActivityContext.Provider value={{ activities, sendActivity }}>
      {props.children}
    </ActivityContext.Provider>
  );
};
