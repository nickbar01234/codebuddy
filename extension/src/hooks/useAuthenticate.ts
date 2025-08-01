import { auth } from "@cb/db";
import {
  getLocalStorage,
  removeLocalStorage,
  sendServiceRequest,
} from "@cb/services";
import { useApp } from "@cb/store";
import { ResponseStatus } from "@cb/types";
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  Unsubscribe,
} from "firebase/auth/web-extension";
import _ from "lodash";
import React from "react";
import { toast } from "sonner";
import { useShallow } from "zustand/shallow";
import { useOnMount } from ".";

interface UseDevAuthenticateProps {}

const AUTHENTICATION_DELAY = 2000;

const useAuthenticate = (_props: UseDevAuthenticateProps) => {
  const unsubscribeRef = React.useRef<Unsubscribe>();
  const { authenticate, unauthenticate } = useApp(
    useShallow((state) => ({
      authenticate: state.actions.authenticate,
      unauthenticate: state.actions.unauthenticate,
    }))
  );

  useOnMount(() => {
    _.delay(() => {
      unsubscribeRef.current = auth.onAuthStateChanged((user) => {
        if (user == null) {
          unauthenticate();
        } else {
          authenticate({ username: user.displayName ?? user.email! });
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
    const signIn = getLocalStorage("signIn");
    if (
      signIn != undefined &&
      isSignInWithEmailLink(auth, window.location.href)
    ) {
      // todo(nickbar01234): Handle signin from different device
      // todo(nickbar01234): Handle error code
      signInWithEmailLink(auth, signIn.email, window.location.href)
        .then(() => sendServiceRequest({ action: "closeSignInTab", signIn }))
        .then((response) => {
          if (response.status === ResponseStatus.SUCCESS) {
            toast.info("Closed sign-in tab");
          }
        })
        .finally(() => {
          removeLocalStorage("signIn");
        });
    }
  });
};

export default useAuthenticate;
