import React from "react";
import { AuthenticationStatus, Status } from "@cb/types";
import { auth } from "@cb/db";
import { useOnMount } from "@cb/hooks";
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth/web-extension";
import { getLocalStorage, removeLocalStorage } from "@cb/services";
import useDevAuthenticate from "@cb/hooks/useAuthenticate";

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

  useDevAuthenticate({
    authenticate: setAuthenticationStatus,
  });

  useOnMount(() => {
    if (isSignInWithEmailLink(auth, window.location.href)) {
      const email = getLocalStorage("email");
      // todo(nickbar01234): Handle signin from different device
      // todo(nickbar01234): Handle error code
      if (email != null)
        signInWithEmailLink(auth, email, window.location.href).then(() =>
          removeLocalStorage("email")
        );
    }
  });

  return <Provider value={{ auth: authenticationStatus }}>{children}</Provider>;
};

export default SessionProvider;
export { sessionContext };
