import { cx } from './class-names';

describe('cx', () => {
  describe('given a mix of class names and falsy values', () => {
    it('when joined, then only the truthy names remain, space separated', () => {
      // Given
      const isActive = false;

      // When
      const result = cx('a', undefined, isActive && 'active', null, 'b');

      // Then
      expect(result).toBe('a b');
    });
  });
});
