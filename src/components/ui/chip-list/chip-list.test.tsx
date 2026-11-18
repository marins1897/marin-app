import { render, screen, within } from '@testing-library/react';
import { axe } from '@/test/axe';
import { ChipList } from './chip-list';

describe('ChipList', () => {
  describe('given a labelled stack', () => {
    it('when rendered, then it is a named list with one item per entry', async () => {
      // Given / When
      const { container } = render(
        <ChipList label="Stack" items={['React', 'Go']} />,
      );

      // Then
      const list = screen.getByRole('list', { name: 'Stack' });
      expect(within(list).getAllByRole('listitem')).toHaveLength(2);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
