import {
  RACE_SAMPLES,
  STRAIGHT_LENGTH,
  STRAIGHT_SAMPLES,
  racePoint,
} from './race-track';

describe('racePoint', () => {
  describe('given a sample on the top straight', () => {
    it('when sampled at a radius, then it lies on z = radius with an outward +z normal', () => {
      // Given
      const index = Math.floor(STRAIGHT_SAMPLES / 2);

      // When
      const point = racePoint(index, 50);

      // Then
      expect(point.z).toBe(50);
      expect(point.nz).toBe(1);
      expect(Math.abs(point.x)).toBeLessThanOrEqual(STRAIGHT_LENGTH / 2);
    });
  });

  describe('given every sample of the outline', () => {
    it('when sampled at a radius, then each point is that far from the nearest curve centre or straight', () => {
      // Given
      const radius = 46.3;
      const half = STRAIGHT_LENGTH / 2;

      // When
      const distances = Array.from({ length: RACE_SAMPLES }, (_, i) => {
        const p = racePoint(i, radius);
        const cx = Math.max(-half, Math.min(half, p.x));
        return Math.hypot(p.x - cx, p.z);
      });

      // Then
      for (const distance of distances) expect(distance).toBeCloseTo(radius, 6);
    });
  });

  describe('given an index past the end', () => {
    it('when sampled, then it wraps around to the start', () => {
      // Given
      const index = RACE_SAMPLES + 3;

      // When
      const point = racePoint(index, 40);

      // Then
      expect(point).toEqual(racePoint(3, 40));
    });
  });
});
