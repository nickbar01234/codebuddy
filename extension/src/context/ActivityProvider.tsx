import { createContext, useContext, useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@cb/db";

interface ActivityContextProps {
  children?: React.ReactNode;
}

const ActivityContext = createContext({});

export const ActivityProvider = (props: ActivityContextProps) => {
  const [activities, setActivities] = useState([]);
  const scroll = useRef();

  useEffect(() => {
    const q = query(
      collection(db, "activities"),
      orderBy("createdAt", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedActivities = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate?.() || new Date(), // Handle Firestore timestamp
      }));

      setActivities(fetchedActivities.reverse()); // Ensure oldest first
    });

    return () => unsubscribe();
  }, []);

  return (
    <ActivityContext.Provider value={{ activities, scroll }}>
      {props.children}
    </ActivityContext.Provider>
  );
};

export const useActivities = () => useContext(ActivityContext);
