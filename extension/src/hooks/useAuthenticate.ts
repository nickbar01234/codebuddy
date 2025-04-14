import { auth } from "@cb/db";
import { getLocalStorage } from "@cb/services";
import { AuthenticationStatus, Status } from "@cb/types";
import { poll } from "@cb/utils/poll";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  Unsubscribe,
} from "firebase/auth/web-extension";
import _ from "lodash";
import React from "react";
import { useOnMount } from ".";

interface UseDevAuthenticateProps {
  authenticate: (session: AuthenticationStatus) => void;
}

const AUTHENTICATION_DELAY = 2000;

const useAuthenticate = ({ authenticate }: UseDevAuthenticateProps) => {
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
    _.delay(() => {
      unsubscribeRef.current = auth.onAuthStateChanged((user) => {
        if (user == null) {
          authenticate({ status: Status.UNAUTHENTICATED });
        } else {
          authenticate({
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
};

export default useAuthenticate;
