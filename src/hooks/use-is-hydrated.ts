import { useSyncExternalStore } from 'react';

const subscribe = () => () => undefined;

/** False in the prerendered HTML and during hydration, true afterwards. */
export const useIsHydrated = (): boolean =>
  useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
