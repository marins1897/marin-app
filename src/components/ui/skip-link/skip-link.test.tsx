import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkipLink } from './skip-link';

describe('SkipLink', () => {
  describe('given a page with a main landmark', () => {
    it('when the keyboard user tabs once, then the skip link is the first focused element', async () => {
      // Given
      const user = userEvent.setup();
      render(
        <>
          <SkipLink href="#main">Skip to main content</SkipLink>
          <a href="/">Logo</a>
          <main id="main">Content</main>
        </>,
      );

      // When
      await user.tab();

      // Then
      expect(
        screen.getByRole('link', { name: 'Skip to main content' }),
      ).toHaveFocus();
    });
  });
});
