import { focusFor } from './stadium-focus';

describe('focusFor', () => {
  describe('given each chapter', () => {
    it('when mapped, then the screens welcome, show the line-up, each player, then the coach, and close on the name', () => {
      // Given
      const stages = [
        { chapter: 'tunnel', playerIndex: -1 },
        { chapter: 'lineup', playerIndex: -1 },
        { chapter: 'intros', playerIndex: 9 },
        { chapter: 'coach', playerIndex: -1 },
        { chapter: 'squad', playerIndex: -1 },
        { chapter: 'contact', playerIndex: -1 },
      ] as const;

      // When
      const focuses = stages.map(focusFor);

      // Then
      expect(focuses).toEqual([
        { kind: 'welcome' },
        { kind: 'lineup' },
        { kind: 'player', index: 9 },
        { kind: 'coach' },
        { kind: 'lineup' },
        { kind: 'name' },
      ]);
    });
  });
});
