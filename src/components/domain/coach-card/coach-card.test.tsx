import { screen, within } from '@testing-library/react';
import { axe } from '@/test/axe';
import { renderWithProviders } from '@/test/render-with-providers';
import { CoachCard } from './coach-card';

describe('CoachCard', () => {
  describe('given the coach chapter is on stage', () => {
    it('when rendered, then it introduces the head coach with formation, style and a trophy cabinet', async () => {
      // Given
      const { container } = renderWithProviders(
        <CoachCard isActive isInert={false} />,
      );

      // When
      const card = screen.getByRole('region', { name: 'Coach card' });

      // Then
      expect(within(card).getByText('Head coach')).toBeInTheDocument();
      expect(within(card).getByText('4-3-3')).toBeInTheDocument();
      expect(
        within(card).getByText('Ship fast, test everything'),
      ).toBeInTheDocument();
      const trophies = within(card).getAllByRole('listitem');
      expect(trophies).toHaveLength(3);
      expect(trophies[0]).toHaveTextContent('puffer.fi rebrand');
      expect(within(card).queryByText('95')).not.toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
