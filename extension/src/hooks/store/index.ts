import { AppStatus, useApp } from "@cb/store";

export const useAuthUser = () => {
  const auth = useApp((state) => state.auth);
  if (auth.status !== AppStatus.AUTHENTICATED) {
    throw new Error(
      "useAuthUser when status is not authenticated. This is most likely a program bug."
    );
  }
  return { user: auth.user };
};
