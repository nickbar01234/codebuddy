import { addEventToRoom, getRoomRef } from "@cb/db";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { createContext, useEffect, useRef, useState } from "react";
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
  scroll: React.MutableRefObject<any>;
  sendActivity: (activity: LogEvent) => void;
}

export const ActivityContext = createContext({} as ActivityContext);

export const ActivityProvider = (props: ActivityContextProps) => {
  const [activities, setActivities] = useState<Activity[]>([] as Activity[]);
  const scroll = useRef();
  const { roomId } = useRTC();

  const sendActivity = (activity: LogEvent) => {
    if (!roomId) return;
    addEventToRoom(activity, roomId);
  };
  useEffect(() => {
    if (!roomId) return;
    const q = query(
      collection(getRoomRef(roomId), "logs"),
      orderBy("times", "desc")
    ).withConverter(logEventConverter);

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedActivities = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timeStamp: doc.data().timestamp,
      }));

      setActivities(fetchedActivities.reverse()); // Ensure oldest first
    });
    return () => unsubscribe();
  }, [roomId]);

  return (
    <ActivityContext.Provider value={{ activities, scroll, sendActivity }}>
      {props.children}
    </ActivityContext.Provider>
  );
};
