import { ExtensionStorage, ServiceRequest, ServiceResponse } from "@cb/types";

export const sendMessage = <T extends ServiceRequest>(
  request: T
): Promise<ServiceResponse[T["action"]]> => chrome.runtime.sendMessage(request);

export const setStorage = (items: Partial<ExtensionStorage>) =>
  chrome.storage.sync.set(items);

export const getStorage = <K extends keyof ExtensionStorage>(key: K) =>
  chrome.storage.sync.get(key).then((pref) => pref[key]) as Promise<
    ExtensionStorage[K]
  >;
