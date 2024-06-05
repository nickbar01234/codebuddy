import { useContext } from "react";
import { monacoContext } from "../context/MonacoProvider";

export const useMonaco = () => {
  const monaco = useContext(monacoContext);
  return monaco;
};
