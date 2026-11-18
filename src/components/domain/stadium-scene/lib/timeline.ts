/**
 * Scroll progress (0 → 1) at which each part of the walk-out starts. The hero's
 * chapters and the camera path both read these, so panels and camera moves
 * can never drift apart.
 */
export const TIMELINE = {
  tunnel: 0,
  walkOut: 0.04,
  lineup: 0.11,
  intros: 0.15,
  coach: 0.84,
  squad: 0.9,
  contact: 0.96,
} as const;

/** Players introduced one by one between `intros` and `coach`. */
export const SQUAD_SIZE = 11;

export const INTRO_SPAN = (TIMELINE.coach - TIMELINE.intros) / SQUAD_SIZE;

/** Progress at which player `index`'s introduction starts. */
export const introStart = (index: number): number =>
  TIMELINE.intros + index * INTRO_SPAN;

/** Progress `fraction` of the way through the chapter that starts at `chapter`. */
export const within = (
  chapter: keyof typeof TIMELINE,
  fraction: number,
): number => {
  const order = Object.values(TIMELINE);
  const start = TIMELINE[chapter];
  const end = order.find((at) => at > start) ?? 1;
  return start + (end - start) * fraction;
};
