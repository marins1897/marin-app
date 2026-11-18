import { useEffect, useRef, useState, type RefObject } from 'react';
import { scrollProgress } from '../utils/scroll-progress';

export interface ScrollProgress<S> {
  /** Live 0 → 1 progress, updated every animation frame; read it in render loops. */
  progressRef: RefObject<number>;
  /** `select(progress)`; React state, so it changes only when the selection does. */
  selected: S;
}

/**
 * Tracks how far `targetRef` has been scrolled through. Frame-rate progress
 * goes to a ref (no re-renders); `select` turns it into something coarse, like
 * a chapter, and only a change of that value re-renders.
 */
export const useScrollProgress = <S>(
  targetRef: RefObject<HTMLElement | null>,
  select: (progress: number) => S,
  isEqual: (a: S, b: S) => boolean = Object.is,
): ScrollProgress<S> => {
  const progressRef = useRef(0);
  const [selected, setSelected] = useState<S>(() => select(0));
  const selectRef = useRef(select);
  const isEqualRef = useRef(isEqual);

  useEffect(() => {
    selectRef.current = select;
    isEqualRef.current = isEqual;
  });

  useEffect(() => {
    let frame = 0;
    const measure = () => {
      frame = 0;
      const target = targetRef.current;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const progress = scrollProgress(
        rect.top,
        rect.height,
        window.innerHeight,
      );
      progressRef.current = progress;
      const next = selectRef.current(progress);
      setSelected((previous) =>
        isEqualRef.current(previous, next) ? previous : next,
      );
    };
    const schedule = () => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };

    schedule();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [targetRef]);

  return { progressRef, selected };
};
