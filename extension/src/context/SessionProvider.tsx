import React from "react";
import { AuthenticationStatus, ResponseStatus, Status } from "@cb/types";
import { auth } from "@cb/db/setup";
import { useOnMount } from "@cb/hooks";
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth/web-extension";
import {
  getLocalStorage,
  removeLocalStorage,
  sendServiceRequest,
} from "@cb/services";
import useAuthenticate from "@cb/hooks/useAuthenticate";
import { toast } from "sonner";

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

  useAuthenticate({
    authenticate: setAuthenticationStatus,
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

  return <Provider value={{ auth: authenticationStatus }}>{children}</Provider>;
};

export default SessionProvider;
export { sessionContext };
