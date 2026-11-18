import {
  createElement,
  Suspense,
  use,
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
} from 'react';
import { cx } from '../lib/cx';
import styles from './lazy-section.module.scss';

export type LazyLoader<P> = () => Promise<{ Component: ComponentType<P> }>;

export interface LazySectionProps<P extends object> {
  /** `() => import('…').then((m) => ({ Component: m.Thing }))` — its own chunk. */
  load: LazyLoader<P>;
  componentProps?: P;
  /** Distance from the viewport at which hydration starts. */
  rootMargin?: string;
  /** Reserve the section's height so late hydration never shifts layout. */
  minHeight?: string;
  className?: string;
}

const resolved = new WeakMap<
  LazyLoader<never>,
  Promise<ComponentType<never>>
>();

const resolve = <P extends object>(
  load: LazyLoader<P>,
): Promise<ComponentType<P>> => {
  const cached = resolved.get(load as LazyLoader<never>);
  if (cached) return cached as Promise<ComponentType<P>>;
  const promise = load().then((module) => module.Component);
  resolved.set(
    load as LazyLoader<never>,
    promise as Promise<ComponentType<never>>,
  );
  return promise;
};

const ServerContent = <P extends object>({
  load,
  componentProps,
}: LazySectionProps<P>) => {
  // The promise is cached per loader, so the component identity is stable.
  const Loaded = use(resolve(load));
  return createElement(Loaded, componentProps as P);
};

/**
 * Deferred hydration for below-the-fold interactive sections.
 *
 * - Build time: renders the component into the HTML (crawlers and no-JS users
 *   get the full content).
 * - Client: keeps the prerendered markup untouched and only downloads +
 *   mounts the chunk once the section is within `rootMargin` of the viewport.
 *
 * Purely static sections do not need this: render them directly.
 */
export const LazySection = <P extends object>({
  load,
  componentProps,
  rootMargin = '200px',
  minHeight,
  className,
}: LazySectionProps<P>) => {
  const ref = useRef<HTMLDivElement>(null);
  const [Component, setComponent] = useState<ComponentType<P> | null>(null);
  const isServer = typeof window === 'undefined';

  useEffect(() => {
    const node = ref.current;
    if (!node || Component) return undefined;

    const hydrate = () => {
      void resolve(load).then((Loaded) => setComponent(() => Loaded));
    };

    if (!('IntersectionObserver' in window)) {
      hydrate();
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          observer.disconnect();
          hydrate();
        }
      },
      { rootMargin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [Component, load, rootMargin]);

  const style = minHeight
    ? ({ '--lazy-section-min-height': minHeight } as CSSProperties)
    : undefined;
  const classes = cx(styles.lazySection, className);

  if (isServer) {
    return (
      <div className={classes} style={style} data-lazy-section="">
        <Suspense fallback={null}>
          <ServerContent load={load} componentProps={componentProps} />
        </Suspense>
      </div>
    );
  }

  if (Component) {
    return (
      <div
        ref={ref}
        className={classes}
        style={style}
        data-lazy-section="hydrated"
      >
        {createElement(Component, componentProps as P)}
      </div>
    );
  }

  // Preserve the server-rendered children without hydrating them. The empty
  // innerHTML is a constant, never user input.
  return (
    <div
      ref={ref}
      className={classes}
      style={style}
      data-lazy-section=""
      suppressHydrationWarning
      // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml -- constant empty string, see above
      dangerouslySetInnerHTML={{ __html: '' }}
    />
  );
};
