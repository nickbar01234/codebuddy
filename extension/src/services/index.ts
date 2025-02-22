import {
  ExtensionStorage,
  LocalStorage,
  ServiceRequest,
  ServiceResponse,
} from "@cb/types";

const LOCAL_STORAGE_PREFIX = "codebuddy";
// todo(nickbar01234): Need a more robust typescript solution
const LOCAL_STORAGE: Array<keyof LocalStorage> = [
  "tabs",
  "lastActivePeer",
  "signIn",
];

export const sendServiceRequest = <T extends ServiceRequest>(
  request: T
): Promise<ServiceResponse[T["action"]]> => chrome.runtime.sendMessage(request);

export const setChromeStorage = (items: Partial<ExtensionStorage>) =>
  chrome.storage.sync.set(items);

export const getChromeStorage = <K extends keyof ExtensionStorage>(key: K) =>
  chrome.storage.sync.get(key).then((pref) => pref[key]) as Promise<
    ExtensionStorage[K]
  >;

export const getLocalStorage = <K extends keyof LocalStorage>(key: K) => {
  const maybeItem = localStorage.getItem(LOCAL_STORAGE_PREFIX + key);
  return maybeItem == null
    ? undefined
    : (JSON.parse(maybeItem) as LocalStorage[K]);
};

export const removeLocalStorage = <K extends keyof LocalStorage>(key: K) => {
  localStorage.removeItem(LOCAL_STORAGE_PREFIX + key);
};

export const setLocalStorage = <K extends keyof LocalStorage>(
  key: K,
  value: LocalStorage[K]
) => {
  localStorage.setItem(LOCAL_STORAGE_PREFIX + key, JSON.stringify(value));
};

export const clearLocalStorage = () => {
  LOCAL_STORAGE.map((key) => LOCAL_STORAGE_PREFIX + key).forEach((key) =>
    localStorage.removeItem(key)
  );
};
