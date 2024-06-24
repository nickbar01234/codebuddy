import { User } from "@cb/types";
import React from "react";

enum State {
  HOME, // Home screen
  ROOM, // In-room
}

interface StateProviderProps {
  children?: React.ReactNode;
  user: User;
}

interface StateContext {
  user: User;
  state: State;
  setState: React.Dispatch<React.SetStateAction<State>>;
}

const stateContext = React.createContext({} as StateContext);

const Provider = stateContext.Provider;

export const StateProvider = (props: StateProviderProps) => {
  const { children, user } = props;
  const [state, setState] = React.useState(State.HOME);

  return (
    <Provider value={{ user: user, state: state, setState: setState }}>
      {children}
    </Provider>
  );
};

export { stateContext, State };
