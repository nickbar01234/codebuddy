import { auth } from "@cb/db";
import { useRoomActions } from "@cb/hooks/store";
import { signOut } from "firebase/auth/web-extension";
import _ from "lodash";
import React from "react";

export const useSignOut = () => {
  const { leave } = useRoomActions();
  return React.useMemo(
    () => _.throttle(() => leave().then(() => signOut(auth)), 1000),
    [leave]
  );
};
