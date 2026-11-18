import { Vector3 } from 'three';
import {
  aimOf,
  monotoneSpline,
  targetOf,
  turnTowards,
  unwrapYaws,
} from './camera-aim';

describe('aimOf and targetOf', () => {
  describe('given a camera and a target', () => {
    it('when converted to angles and back, then the same target comes out', () => {
      // Given
      const position = new Vector3(4, 2, -3);
      const target = new Vector3(-10, 0.5, 6);

      // When
      const back = targetOf(position, aimOf(position, target), new Vector3());

      // Then
      expect(back.distanceTo(target)).toBeLessThan(1e-9);
    });
  });
});

describe('unwrapYaws', () => {
  describe('given headings either side of ±π', () => {
    it('when unwrapped, then each step takes the short way round', () => {
      // Given
      const yaws = [Math.PI - 0.1, -Math.PI + 0.1];

      // When
      const [first, second] = unwrapYaws(yaws);

      // Then
      expect((second ?? 0) - (first ?? 0)).toBeCloseTo(0.2, 9);
    });
  });
});

describe('monotoneSpline', () => {
  describe('given keys that rise then hold', () => {
    it('when sampled between keys, then it passes through the keys and never overshoots', () => {
      // Given
      const spline = monotoneSpline([0, 1, 1, 3]);
      const samples = Array.from({ length: 301 }, (_, i) => spline(i / 100));

      // When
      const keys = [0, 1, 2, 3].map(spline);

      // Then
      expect(keys).toEqual([0, 1, 1, 3]);
      expect(samples.slice(100, 201).every((value) => value === 1)).toBe(true);
      expect(Math.min(...samples)).toBeGreaterThanOrEqual(0);
      expect(Math.max(...samples)).toBeLessThanOrEqual(3);
    });
  });
});

describe('turnTowards', () => {
  describe('given a view half a turn away from where it should look', () => {
    it('when turned, then it moves by the cap only and stays a unit vector', () => {
      // Given
      const current = new Vector3(0, 0, -1);
      const desired = new Vector3(-1, 0, 0);

      // When
      turnTowards(current, desired, 0.3);

      // Then
      expect(current.angleTo(new Vector3(0, 0, -1))).toBeCloseTo(0.3, 6);
      expect(current.length()).toBeCloseTo(1, 9);
    });
  });

  describe('given a view within the cap', () => {
    it('when turned, then it lands exactly on the desired direction', () => {
      // Given
      const current = new Vector3(0, 0, -1);
      const desired = new Vector3(-0.1, 0, -1).normalize();

      // When
      turnTowards(current, desired, 0.3);

      // Then
      expect(current.distanceTo(desired)).toBeLessThan(1e-12);
    });
  });
});
