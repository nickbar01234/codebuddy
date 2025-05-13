import { DocumentReference, onSnapshot, Unsubscribe } from "firebase/firestore";
import React from "react";
import useResource from "./useResource";

export interface UseFirebaseListenerProps<T> {
  reference?: DocumentReference<T>;
  init: T;
}

/**
 * A simple implementation to subscribe a listener to firebase. This is not intended to be use at production-level until
 * we have a Redux store to deduplicate subscribers.
 *
 * @todo(nickbar01234): Migrate implementation post redux
 */
export const useFirebaseListener = <T>({
  reference,
  init,
}: UseFirebaseListenerProps<T>) => {
  const [data, setData] = React.useState<T>(init);
  const { register, evict, get } = useResource<Unsubscribe>({
    name: `${reference?.id ?? ""}DocumentReference`,
  });

  React.useEffect(() => {
    if (reference != undefined && get()[reference.id] == undefined) {
      console.log("Subscribing", reference.id);
      const unsubscribe = onSnapshot(
        reference,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data();
            setData(data);
          }
        },
        (error) => {
          console.error("Error on Firebase listener", error.code);
          evict(reference.id);
        }
      );
      register(reference.id, unsubscribe, (unsubscribe) => unsubscribe());
    }
    return () => {
      if (reference?.id != undefined) evict(reference.id);
    };
  }, [reference, get, register, evict]);

  return {
    data,
  };
};
