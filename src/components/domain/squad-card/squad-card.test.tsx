import { screen } from '@testing-library/react';
import { startingXi } from '@/content/squad';
import { axe } from '@/test/axe';
import { renderWithProviders } from '@/test/render-with-providers';
import { SquadCard } from './squad-card';

const captain = startingXi.find((player) => player.isCaptain);

describe('SquadCard', () => {
  describe('given the captain', () => {
    it('when rendered, then it names the project, says what it is and links to the scout report', async () => {
      // Given
      if (!captain) throw new Error('The squad has no captain');

      // When
      const { container } = renderWithProviders(<SquadCard player={captain} />);

      // Then
      expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
        '#10 NK OSK Otok',
      );
      expect(
        screen.getByText(/full digital home of a Croatian football club/),
      ).toBeInTheDocument();
      expect(screen.queryByText(/^Why /)).not.toBeInTheDocument();
      expect(screen.getByText('Captain')).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /Scout report/ }),
      ).toHaveAttribute('href', '/projects/nk-osk-otok');
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
