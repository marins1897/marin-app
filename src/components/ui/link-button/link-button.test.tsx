import { render, screen } from '@testing-library/react';
import { axe } from '@/test/axe';
import { LinkButton } from './link-button';

describe('LinkButton', () => {
  describe('given a link with a destination', () => {
    it('when rendered, then it is a link with the variant class and forwarded attributes', async () => {
      // Given
      const { container } = render(
        <LinkButton href="/cv.pdf" variant="outline" download>
          Download CV
        </LinkButton>,
      );

      // When
      const link = screen.getByRole('link', { name: 'Download CV' });

      // Then
      expect(link).toHaveAttribute('href', '/cv.pdf');
      expect(link).toHaveAttribute('download');
      expect(link.className).toMatch(/outline/);
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
