/**
 * A tiny external store over one localStorage key, for `useSyncExternalStore`.
 * Reads are safe when storage is unavailable (private mode), writes notify
 * subscribers in this tab and other tabs (via the `storage` event).
 */
export interface LocalStorageStore<T> {
  subscribe: (listener: () => void) => () => void;
  getSnapshot: () => T;
  getServerSnapshot: () => T;
  write: (value: string | null) => void;
}

export const createLocalStorageStore = <T>(
  key: string,
  parse: (raw: string | null) => T,
): LocalStorageStore<T> => {
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((listener) => listener());

  return {
    subscribe: (listener) => {
      listeners.add(listener);
      const onStorage = (event: StorageEvent) => {
        if (event.key === key || event.key === null) listener();
      };
      window.addEventListener('storage', onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', onStorage);
      };
    },
    getSnapshot: () => {
      try {
        return parse(window.localStorage.getItem(key));
      } catch {
        return parse(null);
      }
    },
    getServerSnapshot: () => parse(null),
    write: (value) => {
      try {
        if (value === null) window.localStorage.removeItem(key);
        else window.localStorage.setItem(key, value);
      } catch {
        // Storage unavailable: subscribers still learn about the intent.
      }
      notify();
    },
  };
};
