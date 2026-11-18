import { screen, within } from '@testing-library/react';
import { axe } from '@/test/axe';
import { renderWithProviders } from '@/test/render-with-providers';
import { SiteFooter } from './site-footer';

describe('SiteFooter', () => {
  describe('given the footer', () => {
    it('when rendered, then the social nav is labelled and every external link is safe', async () => {
      // Given
      const { container } = renderWithProviders(<SiteFooter />);

      // When
      const social = screen.getByRole('navigation', { name: 'Social' });

      // Then
      for (const link of within(social).getAllByRole('link')) {
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
        expect(link).toHaveAccessibleName(/opens in a new tab/);
      }
      expect(screen.getByText(/© \d{4} Marin Samardžić/)).toBeInTheDocument();
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
