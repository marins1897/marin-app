import { screen, within } from '@testing-library/react';
import { axe } from '@/test/axe';
import { renderWithProviders } from '@/test/render-with-providers';
import { SquadScreen } from './squad-screen';

describe('SquadScreen', () => {
  describe('given the squad screen is on stage', () => {
    it('when rendered, then every starter links to its scout report and the bench is listed', async () => {
      // Given / When
      const { container } = renderWithProviders(
        <SquadScreen isActive isInert={false} />,
      );

      // Then
      const squad = screen.getByRole('region', { name: 'The squad' });
      const reports = within(squad).getAllByRole('link', {
        name: /Scout report/,
      });
      expect(reports).toHaveLength(11);
      expect(reports[0]).toHaveAttribute('href', '/projects/e-sljedivost');
      expect(within(squad).getByText('Azra music player')).toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
