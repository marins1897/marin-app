import { STRAIGHT_SAMPLES } from './race-track';
import {
  ROWS_END,
  ROWS_SIDE,
  TUNNEL_ROWS,
  isTunnelGap,
  rowsAt,
} from './stand-layout';

describe('stand layout', () => {
  describe('given the middle of a long side and the apex of an end', () => {
    it('when the rows are counted, then the side is full height and the end is low', () => {
      // Given
      const side = Math.floor(STRAIGHT_SAMPLES / 2);
      const endApex = STRAIGHT_SAMPLES + 60;

      // When
      const sideRows = rowsAt(side);
      const endRows = rowsAt(endApex);

      // Then
      expect(sideRows).toBe(ROWS_SIDE);
      expect(endRows).toBe(ROWS_END);
    });
  });

  describe('given the centre of the main stand', () => {
    it('when a row is checked, then only the rows below the tunnel ceiling are cut away', () => {
      // Given
      const centre = STRAIGHT_SAMPLES / 2;

      // When
      const lower = isTunnelGap(centre, 0);
      const upper = isTunnelGap(centre, TUNNEL_ROWS);

      // Then
      expect(lower).toBe(true);
      expect(upper).toBe(false);
    });
  });

  describe('given the opposite stand', () => {
    it('when its lowest row is checked, then nothing is cut away', () => {
      // Given
      const opposite = 2 * STRAIGHT_SAMPLES + 120 - STRAIGHT_SAMPLES / 2;

      // When
      const gap = isTunnelGap(opposite, 0);

      // Then
      expect(gap).toBe(false);
    });
  });
});
