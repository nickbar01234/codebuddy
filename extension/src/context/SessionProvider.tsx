import { auth } from "@cb/db";
import { useOnMount } from "@cb/hooks";
import { getLocalStorage } from "@cb/services";
import { initialAuthenticateCheck } from "@cb/state/session/sessionSlice";
import { AuthenticationStatus, Status } from "@cb/types";
import { poll } from "@cb/utils/poll";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  Unsubscribe,
} from "firebase/auth/web-extension";
import lodash from "lodash";
import React from "react";

const AUTHENTICATION_DELAY = 2000;
interface SessionProviderProps {
  children?: React.ReactNode;
}

interface SessionContext {
  auth: AuthenticationStatus;
}

const sessionContext = React.createContext({} as SessionContext);

const Provider = sessionContext.Provider;

const SessionProvider = (props: SessionProviderProps) => {
  const { children } = props;
  const [authenticationStatus, setAuthenticationStatus] =
    React.useState<AuthenticationStatus>({ status: Status.LOADING });
  const unsubscribeRef = React.useRef<Unsubscribe>();

  useOnMount(() => {
    if (import.meta.env.MODE !== "development") {
      return;
    }

    const selfAuthenticate = async () => {
      const user = await poll({
        fn: async () => getLocalStorage("test"),
        until: (x) => x != undefined,
      });
      if (user != undefined) {
        const { peer } = user;
        createUserWithEmailAndPassword(auth, peer, "TEST_PASSWORD")
          .catch((error) => {
            if (error.code !== "auth/email-already-in-use") {
              console.error(error);
            }
          })
          .finally(() =>
            signInWithEmailAndPassword(auth, peer, "TEST_PASSWORD")
          );
      }
    };

    selfAuthenticate();
  });

  useOnMount(() => {
    lodash.delay(() => {
      unsubscribeRef.current = auth.onAuthStateChanged((user) => {
        if (user == null) {
          setAuthenticationStatus({ status: Status.UNAUTHENTICATED });
        } else {
          setAuthenticationStatus({
            status: Status.AUTHENTICATED,
            user: { username: user.displayName ?? user.email! },
          });
        }
      });
    }, AUTHENTICATION_DELAY);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  });
  useOnMount(() => {
    if (import.meta.env.MODE !== "development") {
      return;
    }

    const selfAuthenticate = async () => {
      const user = await poll({
        fn: async () => getLocalStorage("test"),
        until: (x) => x != undefined,
      });
      if (user != undefined) {
        const { peer } = user;
        createUserWithEmailAndPassword(auth, peer, "TEST_PASSWORD")
          .catch((error) => {
            if (error.code !== "auth/email-already-in-use") {
              console.error(error);
            }
          })
          .finally(() =>
            signInWithEmailAndPassword(auth, peer, "TEST_PASSWORD")
          );
      }
    };

    selfAuthenticate();
  });

  useOnMount(() => {
    lodash.delay(() => {
      unsubscribeRef.current = auth.onAuthStateChanged((user) => {
        if (user == null) {
          setAuthenticationStatus({ status: Status.UNAUTHENTICATED });
        } else {
          setAuthenticationStatus({
            status: Status.AUTHENTICATED,
            user: { username: user.displayName ?? user.email! },
          });
        }
      });
    }, AUTHENTICATION_DELAY);

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  });

  useOnMount(() => {
    initialAuthenticateCheck();
  });

  return <Provider value={{ auth: authenticationStatus }}>{children}</Provider>;
};

export default SessionProvider;
export { sessionContext };
