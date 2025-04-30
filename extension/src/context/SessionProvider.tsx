import { useAppDispatch } from "@cb/hooks";
import {
  devAutoAuth,
  initialAuthenticateCheck,
  listenToAuthChanges,
} from "@cb/state/session/sessionSlice";
import { Unsubscribe } from "firebase/auth/web-extension";
import lodash from "lodash";
import React from "react";

const AUTHENTICATION_DELAY = 2000;
interface SessionProviderProps {
  children?: React.ReactNode;
}

const SessionProvider = (props: SessionProviderProps) => {
  const { children } = props;
  const dispatch = useAppDispatch();
  const unsubscribeRef = React.useRef<Unsubscribe>();
  React.useEffect(() => {
    if (import.meta.env.MODE === "development") {
      dispatch(devAutoAuth());
    }
    dispatch(initialAuthenticateCheck());
    lodash.delay(() => {
      unsubscribeRef.current = dispatch(listenToAuthChanges());
    }, AUTHENTICATION_DELAY);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [dispatch]);

  return <div>{children}</div>;
};

export default SessionProvider;
