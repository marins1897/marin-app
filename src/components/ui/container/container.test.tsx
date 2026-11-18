import { render, screen } from '@testing-library/react';
import { axe } from '@/test/axe';
import { Container } from './container';

describe('Container', () => {
  describe('given a semantic `as` element', () => {
    it('when rendered, then that landmark is exposed with its children and extra classes', async () => {
      // Given
      const { container } = render(
        <Container as="nav" aria-label="Primary" className="extra">
          <a href="/">Home</a>
        </Container>,
      );

      // When
      const nav = screen.getByRole('navigation', { name: 'Primary' });

      // Then
      expect(nav).toContainElement(screen.getByRole('link', { name: 'Home' }));
      expect(nav).toHaveClass('extra');
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
