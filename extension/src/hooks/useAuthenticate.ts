import { auth } from "@cb/db";
import { useOnMount } from ".";
import { getLocalStorage } from "@cb/services";
import { AuthenticationStatus, Status } from "@cb/types";
import React from "react";
import _ from "lodash";
import { Unsubscribe } from "firebase/auth";

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
      authenticate({
        status: Status.AUTHENTICATED,
        user: { username: peer },
      });
    }
  });

  useOnMount(() => {
    if (import.meta.env.MODE === "development") {
      return;
    }

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
