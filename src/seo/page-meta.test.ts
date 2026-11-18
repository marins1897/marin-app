import { buildPageLinks, buildPageMeta, documentTitle } from './page-meta';

const jsonLdTypes = (meta: ReturnType<typeof buildPageMeta>) =>
  meta.flatMap((d) =>
    'script:ld+json' in d
      ? [(d['script:ld+json'] as { '@type': string })['@type']]
      : [],
  );

describe('buildPageMeta', () => {
  describe('given a nested page with breadcrumbs', () => {
    it('when built, then it carries the suffixed title, absolute URLs and WebPage + BreadcrumbList JSON-LD', () => {
      // Given
      const input = {
        pathname: '/restake',
        title: 'Restake',
        description: 'Projects by Marin.',
        breadcrumbs: [
          { name: 'Home', pathname: '/' },
          { name: 'Restake', pathname: '/restake' },
        ],
      };

      // When
      const meta = buildPageMeta(input);

      // Then
      expect(meta).toContainEqual({ title: 'Restake | Marin Samardžić' });
      expect(meta).toContainEqual({
        property: 'og:url',
        content: 'https://marin-iota.vercel.app/restake',
      });
      expect(meta).toContainEqual({
        property: 'og:image',
        content: 'https://marin-iota.vercel.app/images/og-default.jpg',
      });
      expect(jsonLdTypes(meta)).toEqual(['WebPage', 'BreadcrumbList']);
      expect(buildPageLinks('/restake')).toEqual([
        {
          rel: 'canonical',
          href: 'https://marin-iota.vercel.app/restake',
        },
        {
          rel: 'alternate',
          hrefLang: 'x-default',
          href: 'https://marin-iota.vercel.app/restake',
        },
        {
          rel: 'alternate',
          hrefLang: 'en',
          href: 'https://marin-iota.vercel.app/restake',
        },
        {
          rel: 'alternate',
          hrefLang: 'hr',
          href: 'https://marin-iota.vercel.app/hr/restake',
        },
      ]);
    });
  });

  describe('given the Croatian version of a nested page', () => {
    it('when built, then its URLs, breadcrumbs and Open Graph locale live under /hr', () => {
      // Given
      const input = {
        pathname: '/restake',
        locale: 'hr' as const,
        title: 'Restake',
        description: 'Projekti.',
        breadcrumbs: [
          { name: 'Početna', pathname: '/' },
          { name: 'Restake', pathname: '/restake' },
        ],
      };

      // When
      const meta = buildPageMeta(input);
      const breadcrumbs = meta.find(
        (d) =>
          'script:ld+json' in d &&
          (d['script:ld+json'] as { '@type': string })['@type'] ===
            'BreadcrumbList',
      );

      // Then
      expect(meta).toContainEqual({
        property: 'og:url',
        content: 'https://marin-iota.vercel.app/hr/restake',
      });
      expect(meta).toContainEqual({ property: 'og:locale', content: 'hr_HR' });
      expect(JSON.stringify(breadcrumbs)).toContain(
        'https://marin-iota.vercel.app/hr',
      );
      expect(buildPageLinks('/restake', { locale: 'hr' })[0]).toEqual({
        rel: 'canonical',
        href: 'https://marin-iota.vercel.app/hr/restake',
      });
    });
  });

  describe('given the home page', () => {
    it('when built, then the title has no suffix and Person + WebSite JSON-LD are present', () => {
      // Given / When
      const meta = buildPageMeta({
        pathname: '/',
        title: 'Marin Samardžić',
        description: 'Home.',
      });

      // Then
      expect(documentTitle('Marin', '/')).toBe('Marin');
      expect(meta).toContainEqual({ title: 'Marin Samardžić' });
      expect(jsonLdTypes(meta)).toEqual(['Person', 'WebSite', 'WebPage']);
    });
  });
});
