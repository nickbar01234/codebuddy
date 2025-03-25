import { getRoomRef } from "@cb/db";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRTC } from "../hooks";
import { LogEvent, logEventConverter } from "../db/converter";
interface ActivityContextProps {
  children?: React.ReactNode;
}

interface ActivityContext {
  activities: LogEvent[];
  scroll: React.MutableRefObject<any>;
}

const ActivityContext = createContext({} as ActivityContext);

export const ActivityProvider = (props: ActivityContextProps) => {
  const [activities, setActivities] = useState<LogEvent[]>([] as LogEvent[]);
  const scroll = useRef();
  const { roomId } = useRTC();

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
    <ActivityContext.Provider value={{ activities, scroll }}>
      {props.children}
    </ActivityContext.Provider>
  );
};

export const useActivities = () => useContext(ActivityContext);
