import { scrollProgress } from './scroll-progress';

describe('scrollProgress', () => {
  describe('given a 3000px element in a 1000px viewport', () => {
    it('when its top is still below the viewport top, then progress is 0', () => {
      // Given
      const top = 120;

      // When
      const progress = scrollProgress(top, 3000, 1000);

      // Then
      expect(progress).toBe(0);
    });

    it('when it is scrolled halfway, then progress is 0.5', () => {
      // Given
      const top = -1000;

      // When
      const progress = scrollProgress(top, 3000, 1000);

      // Then
      expect(progress).toBe(0.5);
    });

    it('when it is scrolled past its end, then progress stays at 1', () => {
      // Given
      const top = -2600;

      // When
      const progress = scrollProgress(top, 3000, 1000);

      // Then
      expect(progress).toBe(1);
    });
  });

  describe('given an element no taller than the viewport', () => {
    it('when measured, then progress is 0', () => {
      // Given
      const height = 800;

      // When
      const progress = scrollProgress(-100, height, 1000);

      // Then
      expect(progress).toBe(0);
    });
  });
});
