import { screen } from '@testing-library/react';
import { homeContent } from '@/content/home';
import { renderWithProviders } from '@/test/render-with-providers';
import HomePage, { links, meta } from './home';

type MetaArgs = Parameters<typeof meta>[0];

describe('home route', () => {
  describe('given the home route', () => {
    it('when rendered, then it shows exactly one h1, the name', () => {
      // Given / When
      renderWithProviders(<HomePage />, { route: '/' });

      // Then
      const headings = screen.getAllByRole('heading', { level: 1 });
      expect(headings).toHaveLength(1);
      expect(headings[0]).toHaveAccessibleName('Marin Samardžić');
    });

    it('when meta and links are built, then the title has no suffix and the canonical is the site root', () => {
      // Given / When
      const descriptors = meta({} as MetaArgs);
      const linkDescriptors = links();

      // Then
      expect(descriptors).toContainEqual({ title: homeContent.seo.title });
      expect(descriptors).toContainEqual({
        name: 'robots',
        content: 'index, follow',
      });
      expect(descriptors.some((d) => 'script:ld+json' in d)).toBe(true);
      expect(linkDescriptors).toContainEqual({
        rel: 'canonical',
        href: 'https://marin-portfolio1897.vercel.app/',
      });
    });
  });
});
