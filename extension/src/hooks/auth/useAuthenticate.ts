import { useOnMount } from "@cb/hooks";
import { useAuthActions } from "@cb/hooks/store";
import { getLocalStorage, removeLocalStorage } from "@cb/services";
import background from "@cb/services/background";
import { auth } from "@cb/services/db";
import { ResponseStatus } from "@cb/types";
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  Unsubscribe,
} from "firebase/auth/web-extension";
import _ from "lodash";
import React from "react";
import { toast } from "sonner";

interface UseDevAuthenticateProps {}

const AUTHENTICATION_DELAY = 2000;

export const useAuthenticate = (_props: UseDevAuthenticateProps) => {
  const unsubscribeRef = React.useRef<Unsubscribe>();
  const { authenticate, unauthenticate } = useAuthActions();

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
        .then(() => background.closeSignInTab({ signIn }))
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
