import { introOrder, startingXi } from './squad';

describe('introOrder', () => {
  describe('given the starting XI', () => {
    it('when introduced, then every player walks out once, keeper first and striker last', () => {
      // Given
      const shirts = startingXi.map((player) => player.number).sort();

      // When
      const order = introOrder.map((player) => player.number);

      // Then
      expect([...order].sort()).toEqual(shirts);
      expect(order).toEqual([
        '1',
        '2',
        '5',
        '4',
        '3',
        '6',
        '8',
        '10',
        '7',
        '11',
        '9',
      ]);
    });
  });
});
