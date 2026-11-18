type Callback = IntersectionObserverCallback;

const observers = new Set<{
  callback: Callback;
  targets: Set<Element>;
  instance: IntersectionObserver;
}>();

/** Deterministic IntersectionObserver: nothing intersects until `intersect()` is called. */
export const installIntersectionObserverMock = (): void => {
  class MockIntersectionObserver implements IntersectionObserver {
    readonly root = null;
    readonly rootMargin: string;
    readonly thresholds: readonly number[] = [0];
    readonly scrollMargin = '0px';
    private readonly targets = new Set<Element>();
    private readonly entry: {
      callback: Callback;
      targets: Set<Element>;
      instance: IntersectionObserver;
    };

    constructor(callback: Callback, options?: IntersectionObserverInit) {
      this.rootMargin = options?.rootMargin ?? '0px';
      this.entry = { callback, targets: this.targets, instance: this };
      observers.add(this.entry);
    }

    observe(target: Element): void {
      this.targets.add(target);
    }

    unobserve(target: Element): void {
      this.targets.delete(target);
    }

    disconnect(): void {
      this.targets.clear();
      observers.delete(this.entry);
    }

    takeRecords(): IntersectionObserverEntry[] {
      return [];
    }
  }

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: MockIntersectionObserver,
  });
};

/** Reports every observed element as intersecting. */
export const intersectAll = (): void => {
  for (const { callback, targets, instance } of [...observers]) {
    const entries = [...targets].map(
      (target) =>
        ({
          isIntersecting: true,
          target,
          intersectionRatio: 1,
        }) as IntersectionObserverEntry,
    );
    if (entries.length > 0) callback(entries, instance);
  }
};
