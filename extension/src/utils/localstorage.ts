import { STORAGE_PREFIX } from "@cb/constants";
import { LocalStorage } from "@cb/types";

const LOCAL_STORAGE: Array<keyof LocalStorage> = ["signIn"];

export const getLocalStorage = <K extends keyof LocalStorage>(key: K) => {
  const maybeItem = localStorage.getItem(STORAGE_PREFIX + key);
  return maybeItem == null
    ? undefined
    : (JSON.parse(maybeItem) as LocalStorage[K]);
};

export const removeLocalStorage = <K extends keyof LocalStorage>(key: K) => {
  localStorage.removeItem(STORAGE_PREFIX + key);
};

export const setLocalStorage = <K extends keyof LocalStorage>(
  key: K,
  value: LocalStorage[K]
) => {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
};

export const clearLocalStorage = (ignore: Array<keyof LocalStorage> = []) =>
  LOCAL_STORAGE.filter((key) => !ignore.includes(key)).forEach(
    removeLocalStorage
  );

export const clearLocalStorageForRoom = () => clearLocalStorage(["signIn"]);
