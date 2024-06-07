import { User } from "../types";
import React from "react";

interface UserProviderProps {
  children?: React.ReactNode;
  user: User;
}

interface UserContext extends User {}

const userContext = React.createContext({} as UserContext);

const Provider = userContext.Provider;

const UserProvider = (props: UserProviderProps) => {
  const { children, user } = props;
  return <Provider value={user}>{children}</Provider>;
};

export default UserProvider;
export { userContext };
