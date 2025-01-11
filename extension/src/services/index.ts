import {
  ExtensionStorage,
  LocalStorage,
  ServiceRequest,
  ServiceResponse,
} from "@cb/types";

const LOCAL_STORAGE_KEY = "codebuddy";

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
  const store = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? "{}");
  return store[key] as LocalStorage[K] | undefined;
};

export const setLocalStorage = (items: Partial<LocalStorage>) => {
  const store = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) ?? "{}");
  localStorage.setItem(
    LOCAL_STORAGE_KEY,
    JSON.stringify({ ...store, ...items })
  );
};

export const clearLocalStorage = () =>
  localStorage.removeItem(LOCAL_STORAGE_KEY);
