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
import React from "react";
import { useOnMount } from "@cb/hooks/index";
import { waitForElement } from "@cb/utils";
import {
  LEETCODE_SUBMIT_BUTTON,
  LEETCODE_SUBMISSION_RESULT,
  LEETCODE_SUBMISSION_DETAILS,
} from "@cb/constants/page-elements";
import { useAppState } from "@cb/hooks/index";

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
  const {
    user: { username },
  } = useAppState();

  const sendActivity = React.useCallback(
    (activity: Omit<LogEvent, "timestamp">) => {
      if (!roomId) return;
      addEventToRoom(activity, roomId);
    },
    [roomId]
  );

  useOnMount(() => {
    waitForElement(LEETCODE_SUBMIT_BUTTON, 2000)
      .then((button) => button as HTMLButtonElement)
      .then((button) => {
        const originalOnClick = button.onclick;
        button.onclick = function (event) {
          if (originalOnClick) {
            originalOnClick.call(this, event);
          }

          waitForElement(LEETCODE_SUBMISSION_RESULT, 10000)
            .then(() =>
              sendActivity({
                type: "submission",
                payload: {
                  username: username,
                  status: "success",
                  output: "Accepted",
                },
              })
            )
            .catch(() =>
              waitForElement(LEETCODE_SUBMISSION_DETAILS, 10000).then(
                (element) => {
                  const errorMessage = element.textContent;
                  sendActivity({
                    type: "submission",
                    payload: {
                      username: username,

                      status: "error",
                      output: errorMessage ?? "Failed",
                    },
                  });
                }
              )
            );
        };
      })
      .catch((error) => {
        console.error("Error mounting callback on submit code button:", error);
      });
  });
  useEffect(() => {
    if (!roomId) return;
    const q = query(
      collection(getRoomRef(roomId), "logs"),
      orderBy("timestamp", "desc")
    ).withConverter(logEventConverter);

    const fetchSnapshot = onSnapshot(q, (querySnapshot) => {
      if (
        querySnapshot.docs.some(
          (doc) => !(doc.data().timestamp instanceof Timestamp)
        )
      ) {
        return;
      }
      const fetchedActivities = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp,
      }));

      setActivities(fetchedActivities.reverse()); // Ensure oldest first
    });
    registerSnapshot("activity", fetchSnapshot, (prev) => prev());
  }, [roomId, registerSnapshot]);

  return (
    <ActivityContext.Provider value={{ activities, sendActivity }}>
      {props.children}
    </ActivityContext.Provider>
  );
};
