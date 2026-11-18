import { createLocalStorageStore } from './local-storage-store';

describe('createLocalStorageStore', () => {
  describe('given a subscribed listener', () => {
    it('when a value is written, then storage holds it and the listener is notified', () => {
      // Given
      const store = createLocalStorageStore('k', (raw) => raw ?? 'none');
      const listener = vi.fn();
      store.subscribe(listener);

      // When
      store.write('v');

      // Then
      expect(window.localStorage.getItem('k')).toBe('v');
      expect(store.getSnapshot()).toBe('v');
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('given nothing is stored', () => {
    it('when snapshots are read, then client and server agree on the parsed default', () => {
      // Given
      const store = createLocalStorageStore('k', (raw) => raw ?? 'none');

      // When / Then
      expect(store.getSnapshot()).toBe('none');
      expect(store.getServerSnapshot()).toBe('none');
    });
  });
});
