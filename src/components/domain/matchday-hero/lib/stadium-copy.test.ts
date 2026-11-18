import { startingXi } from '@/content/squad';
import { i18n } from '@/i18n/i18n';
import { buildStadiumCopy } from './stadium-copy';

describe('buildStadiumCopy', () => {
  describe('given the English copy and the starting XI', () => {
    it('when built, then every player gets number, slot, title, detail line and board text', () => {
      // Given
      const t = i18n.getFixedT('en', 'home');
      const ts = i18n.getFixedT('en', 'squad');

      // When
      const copy = buildStadiumCopy(t, ts, startingXi);

      // Then
      expect(copy.players).toHaveLength(11);
      expect(copy.players[9]).toMatchObject({
        number: '10',
        slot: 'LCM',
        isCaptain: true,
        title: 'NK OSK Otok',
        detail: 'CM · Captain · Side project · club platform',
        board: '#10 NK OSK OTOK · CAPTAIN · CM',
      });
      expect(copy.lineup.title).toBe('Inter Faces');
    });
  });
});
