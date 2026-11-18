import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { scrollProgress } from '@/utils/scroll-progress';
import { stepFrom, type Stop } from './stage';

/** How long a jump counts as "in flight", so quick key presses keep stepping onwards. */
const IN_FLIGHT_MS = 1200;

const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

/**
 * Jumps through the walk-out: `goTo(stop)` scrolls the track to a stop, and
 * ← / → step to the previous / next stop while the stadium is on screen.
 * Returns `goTo` for the chapter rail and the skip link.
 */
export const useStageNavigation = (
  trackRef: RefObject<HTMLElement | null>,
): ((stop: Stop) => void) => {
  const headingRef = useRef<{ at: number; until: number } | null>(null);

  const goTo = useCallback(
    (target: Stop) => {
      const track = trackRef.current;
      if (!track) return;
      const scrollable = track.offsetHeight - window.innerHeight;
      const top =
        track.getBoundingClientRect().top +
        window.scrollY +
        target.at * scrollable;
      headingRef.current = {
        at: target.at,
        until: performance.now() + IN_FLIGHT_MS,
      };
      window.scrollTo({
        top,
        behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      });
    },
    [trackRef],
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
      if (
        event.defaultPrevented ||
        event.altKey ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        isTyping(event.target)
      )
        return;
      const track = trackRef.current;
      if (!track) return;
      const rect = track.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= window.innerHeight) return;

      const inFlight = headingRef.current;
      const from =
        inFlight && inFlight.until > performance.now()
          ? inFlight.at
          : scrollProgress(rect.top, rect.height, window.innerHeight);
      const next = stepFrom(from, event.key === 'ArrowRight' ? 1 : -1);
      if (!next) return;
      event.preventDefault();
      goTo(next);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goTo, trackRef]);

  return goTo;
};
