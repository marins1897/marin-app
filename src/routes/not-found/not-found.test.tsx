import { screen } from '@testing-library/react';
import { renderWithProviders } from '@/test/render-with-providers';
import NotFoundPage, { meta } from './not-found';

type MetaArgs = Parameters<typeof meta>[0];

describe('not-found route', () => {
  describe('given an unknown URL', () => {
    it('when rendered, then it explains the error and links home', () => {
      // Given / When
      renderWithProviders(<NotFoundPage />, { route: '/missing' });

      // Then
      expect(
        screen.getByRole('heading', { level: 1, name: 'Offside!' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Back to the squad' }),
      ).toHaveAttribute('href', '/');
    });

    it('when meta is built, then the page asks not to be indexed and carries the site suffix', () => {
      // Given / When
      const descriptors = meta({} as MetaArgs);

      // Then
      expect(descriptors).toContainEqual({
        name: 'robots',
        content: 'noindex, nofollow',
      });
      expect(descriptors).toContainEqual({
        title: 'Offside: page not found | Marin Samardžić',
      });
    });
  });
});
