import { STORAGE_PREFIX } from "@cb/constants";
import { SessionStorage } from "@cb/types";

export const getSessionStorage = <K extends keyof SessionStorage>(key: K) => {
  const maybeItem = sessionStorage.getItem(STORAGE_PREFIX + key);
  return maybeItem == null
    ? undefined
    : (JSON.parse(maybeItem) as SessionStorage[K]);
};

export const removeSessionStorage = <K extends keyof SessionStorage>(
  key: K
) => {
  sessionStorage.removeItem(STORAGE_PREFIX + key);
};

export const setSessionStorage = <K extends keyof SessionStorage>(
  key: K,
  value: SessionStorage[K]
) => {
  sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
};
