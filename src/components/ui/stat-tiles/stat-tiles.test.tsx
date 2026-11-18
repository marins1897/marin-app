import { render, screen } from '@testing-library/react';
import { axe } from '@/test/axe';
import { StatTiles } from './stat-tiles';

describe('StatTiles', () => {
  describe('given three stats', () => {
    it('when rendered, then each value is described by its label', async () => {
      // Given
      const items = [
        { value: '130', label: 'teams' },
        { value: '5', label: 'sports' },
        { value: '2', label: 'days' },
      ];

      // When
      const { container } = render(<StatTiles items={items} />);

      // Then
      expect(screen.getByText('130')).toBeInTheDocument();
      expect(screen.getAllByRole('term')).toHaveLength(3);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
