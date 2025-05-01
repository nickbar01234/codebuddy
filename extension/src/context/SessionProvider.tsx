import { useAppDispatch } from "@cb/hooks";
import useResource from "@cb/hooks/useResource";
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
  const { register, evict } = useResource<Unsubscribe>({
    name: "session",
  });

  React.useEffect(() => {
    setTimeout(() => {
      dispatch(initialAuthenticateCheck());
    }, AUTHENTICATION_DELAY); // wait for the auth emulator to be initialized
    lodash.delay(() => {
      const unsubscribe = dispatch(listenToAuthChanges());
      register("authentication", unsubscribe, (unsubscribe) => unsubscribe());
    }, AUTHENTICATION_DELAY);
    return () => {
      evict("authentication");
    };
  }, [dispatch, register, evict]);

  return children;
};

export default SessionProvider;
