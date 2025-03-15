import { auth } from "@cb/db";
import { useOnMount } from ".";
import { getLocalStorage } from "@cb/services";
import { AuthenticationStatus, Status } from "@cb/types";
import React from "react";
import _ from "lodash";
import { Unsubscribe } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth/web-extension";

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

    const user = getLocalStorage("test");
    if (user != undefined) {
      const { peer } = user;
      createUserWithEmailAndPassword(auth, peer, "TEST_PASSWORD")
        .catch((error) => {
          if (error.code !== "auth/email-already-in-use") {
            console.error(error);
          }
        })
        .finally(() => signInWithEmailAndPassword(auth, peer, "TEST_PASSWORD"));
    }
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
