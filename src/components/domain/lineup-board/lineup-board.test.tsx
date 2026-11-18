import { screen, within } from '@testing-library/react';
import { axe } from '@/test/axe';
import { renderWithProviders } from '@/test/render-with-providers';
import { LineupBoard } from './lineup-board';

describe('LineupBoard', () => {
  describe('given the line-up is on stage', () => {
    it('when rendered, then the team sheet lists eleven players in shirt order with the captain marked', async () => {
      // Given / When
      const { container } = renderWithProviders(
        <LineupBoard isActive isInert={false} />,
      );

      // Then
      const sheet = screen.getByRole('region', { name: 'Inter Faces' });
      const rows = within(sheet).getAllByRole('listitem');
      expect(rows).toHaveLength(11);
      expect(rows[0]).toHaveTextContent('1e-SljedivostGK');
      expect(
        within(rows[9] as HTMLElement).getByTitle('Captain'),
      ).toBeInTheDocument();
      expect(
        within(sheet).getByText('Marin Samardžić', { exact: false }),
      ).toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
