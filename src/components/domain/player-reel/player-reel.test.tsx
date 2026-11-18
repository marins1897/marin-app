import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/render-with-providers';
import { PlayerReel } from './player-reel';

describe('PlayerReel', () => {
  describe('given the tenth player is being introduced', () => {
    it('when rendered, then all eleven cards are in the document and only the captain is current', () => {
      // Given
      const activeIndex = 9;

      // When
      renderWithProviders(
        <PlayerReel activeIndex={activeIndex} isInert={false} />,
      );

      // Then
      const reel = screen.getByRole('region', { name: 'Starting XI' });
      const cards = [...reel.querySelectorAll(':scope > ol > li')];
      expect(cards).toHaveLength(11);
      expect(cards[9]).toHaveAttribute('data-current');
      expect(cards[0]).not.toHaveAttribute('data-current');
      expect(screen.getByText('Player 10 of 11')).toBeInTheDocument();
    });
  });
});
