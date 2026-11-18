import { render, screen } from '@testing-library/react';
import { axe } from '@/test/axe';
import { Tag } from './tag';

describe('Tag', () => {
  describe('given a brand tag', () => {
    it('when rendered, then its text reads normally and it carries the tone class', async () => {
      // Given
      const { container } = render(<Tag tone="brand">01</Tag>);

      // When
      const text = screen.getByText('01');

      // Then
      expect(text.parentElement?.className).toMatch(/brand/);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
