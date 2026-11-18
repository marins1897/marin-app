import { screen, within } from '@testing-library/react';
import { axe } from '@/test/axe';
import { renderWithProviders } from '@/test/render-with-providers';
import { SiteHeader } from './site-header';

describe('SiteHeader', () => {
  describe('given the home route', () => {
    it('when rendered, then the banner links home and the nav offers the profile and the CV download', async () => {
      // Given
      const { container } = renderWithProviders(<SiteHeader />, { route: '/' });

      // When
      const nav = screen.getByRole('navigation', { name: 'Main navigation' });

      // Then
      expect(
        screen.getByRole('link', { name: 'Marin Samardžić, home' }),
      ).toHaveAttribute('href', '/');
      expect(
        within(nav).getByRole('link', { name: 'Download CV' }),
      ).toHaveAttribute('href', '/cv/marin-samardzic-cv.pdf');
      expect(screen.queryByText('Open to work')).not.toBeInTheDocument();
      expect(
        within(nav).getByRole('link', { name: 'Profile' }),
      ).toHaveAttribute('href', '/#profile');
      expect(await axe(container)).toHaveNoViolations();
    });
  });
});
