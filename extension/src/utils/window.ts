interface LocalStorage {
  email: string;
}

export const setLocalStorage = <T extends keyof LocalStorage>(
  key: T,
  value: LocalStorage[T]
) => window.localStorage.setItem(key, value);

export const getLocalStorage = <T extends keyof LocalStorage>(
  key: T
): LocalStorage[T] | null => window.localStorage.getItem(key);

export const removeLocalStorage = <T extends keyof LocalStorage>(key: T) =>
  window.localStorage.removeItem(key);
