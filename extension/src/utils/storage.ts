import { STORAGE_PREFIX } from "@cb/constants";
import { LocalStorage, SessionStorage } from "@cb/types";

const createStorageHelpers = <T>(storage: () => Storage) => ({
  get: <K extends keyof T>(key: K): T[K] | undefined => {
    const maybeItem = storage().getItem(STORAGE_PREFIX + String(key));
    return maybeItem == null ? undefined : (JSON.parse(maybeItem) as T[K]);
  },
  set: <K extends keyof T>(key: K, value: T[K]) => {
    storage().setItem(STORAGE_PREFIX + String(key), JSON.stringify(value));
  },
  remove: <K extends keyof T>(key: K) => {
    storage().removeItem(STORAGE_PREFIX + String(key));
  },
});

const getLocalStore = () => localStorage;
const getSessionStore = () => sessionStorage;

const local = createStorageHelpers<LocalStorage>(getLocalStore);
const session = createStorageHelpers<SessionStorage>(getSessionStore);

export const getLocalStorage = local.get;
export const setLocalStorage = local.set;
export const removeLocalStorage = local.remove;

export const getSessionStorage = session.get;
export const setSessionStorage = session.set;
export const removeSessionStorage = session.remove;

const LOCAL_STORAGE_KEYS: Array<keyof LocalStorage> = ["signIn"];

export const clearLocalStorage = (ignore: Array<keyof LocalStorage> = []) =>
  LOCAL_STORAGE_KEYS.filter((key) => !ignore.includes(key)).forEach(
    removeLocalStorage
  );

export const clearLocalStorageForRoom = () => clearLocalStorage(["signIn"]);
