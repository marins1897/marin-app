/**
 * How far a tall element has been scrolled through, 0 → 1. 0 while its top is
 * at or below the viewport top, 1 once its bottom reaches the viewport bottom.
 */
export const scrollProgress = (
  top: number,
  height: number,
  viewportHeight: number,
): number => {
  const scrollable = height - viewportHeight;
  if (scrollable <= 0) return 0;
  return Math.min(1, Math.max(0, -top / scrollable));
};
