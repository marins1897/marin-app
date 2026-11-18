import { loadAnalytics } from './analytics';

const SITE = 'https://marin-iota.vercel.app';
const analyticsScripts = () =>
  document.querySelectorAll('script[data-analytics]');

describe('loadAnalytics', () => {
  afterEach(() => {
    for (const script of analyticsScripts()) script.remove();
  });

  describe('given the production host', () => {
    it('when loaded twice, then the Vercel script is added once', () => {
      // Given
      const hostname = 'marin-iota.vercel.app';

      // When
      loadAnalytics(SITE, hostname);
      loadAnalytics(SITE, hostname);

      // Then
      expect(analyticsScripts()).toHaveLength(1);
      expect(analyticsScripts()[0]).toHaveAttribute(
        'src',
        '/_vercel/insights/script.js',
      );
    });
  });

  describe('given localhost or a preview deployment', () => {
    it('when loaded, then nothing is added', () => {
      // Given
      const hosts = ['localhost', 'marin-git-feature-marins1897.vercel.app'];

      // When
      for (const host of hosts) loadAnalytics(SITE, host);

      // Then
      expect(analyticsScripts()).toHaveLength(0);
    });
  });
});
