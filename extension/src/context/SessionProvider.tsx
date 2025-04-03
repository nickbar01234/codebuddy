import { useOnMount } from "@cb/hooks";
import useAuthenticate from "@cb/hooks/useAuthenticate";
import { initialAuthenticateCheck } from "@cb/state/session/sessionSlice";
import { AuthenticationStatus, Status } from "@cb/types";
import React from "react";
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
    initialAuthenticateCheck();
  });

  return <Provider value={{ auth: authenticationStatus }}>{children}</Provider>;
};

export default SessionProvider;
export { sessionContext };
