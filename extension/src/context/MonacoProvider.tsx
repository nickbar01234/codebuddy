import React from "react";
import { sendMessage } from "../services";

export interface MonacoProps {
  children?: React.ReactNode;
}
export interface MonacoContext {
  getValue: () => Promise<string>;
  setValue: (value: string) => Promise<void>;
}

export const monacoContext = React.createContext({} as MonacoContext);

const Provider = monacoContext.Provider;

const MonacoProvider = (props: MonacoProps) => {
  const { children } = props;
  return (
    <Provider
      value={{
        getValue: () => sendMessage({ action: "getValue" }),
        setValue: (value: string) => sendMessage({ action: "setValue", value }),
      }}
    >
      {children}
    </Provider>
  );
};

export default MonacoProvider;
