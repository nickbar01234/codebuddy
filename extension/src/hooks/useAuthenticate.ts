import { auth } from "@cb/db";
import { useOnMount } from ".";
import { getLocalStorage } from "@cb/services";
import { AuthenticationStatus, Status } from "@cb/types";

interface UseDevAuthenticateProps {
  authenticate: (session: AuthenticationStatus) => void;
}

const useDevAuthenticate = ({ authenticate }: UseDevAuthenticateProps) => {
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
    auth.onAuthStateChanged((user) => {
      if (user == null) {
        authenticate({ status: Status.UNAUTHENTICATED });
      } else {
        authenticate({
          status: Status.AUTHENTICATED,
          user: { username: user.displayName ?? user.email! },
        });
      }
    });
  });
};

export default useDevAuthenticate;
