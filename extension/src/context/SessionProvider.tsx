import { useAppDispatch, useSession } from "@cb/hooks";
import {
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
  const { auth } = useSession();
  console.log("HELLO");
  console.log("SessionProvider", auth);
  React.useEffect(() => {
    console.log("SessionProvider", auth);
  }, [auth]);
  React.useEffect(() => {
    setTimeout(() => {
      dispatch(initialAuthenticateCheck());
    }, AUTHENTICATION_DELAY); // wait for the auth emulator to be initialized
    lodash.delay(() => {
      unsubscribeRef.current = dispatch(listenToAuthChanges());
    }, AUTHENTICATION_DELAY);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [dispatch]);

  return children;
};

export default SessionProvider;
