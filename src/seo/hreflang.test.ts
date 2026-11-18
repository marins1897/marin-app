import { localeOf, localizedPath, unlocalizedPath } from './hreflang';

describe('locale paths', () => {
  describe('given English and Croatian URLs', () => {
    it('when read, then the locale comes from the prefix and round-trips through the unprefixed path', () => {
      // Given
      const paths = ['/', '/projects/playgrnd', '/hr', '/hr/projects/playgrnd'];

      // When
      const parsed = paths.map((path) => ({
        locale: localeOf(path),
        base: unlocalizedPath(path),
      }));

      // Then
      expect(parsed).toEqual([
        { locale: 'en', base: '/' },
        { locale: 'en', base: '/projects/playgrnd' },
        { locale: 'hr', base: '/' },
        { locale: 'hr', base: '/projects/playgrnd' },
      ]);
      expect(localizedPath('/', 'hr')).toBe('/hr');
      expect(localizedPath('/projects/playgrnd', 'en')).toBe(
        '/projects/playgrnd',
      );
      expect(localeOf('/hrvatska')).toBe('en');
    });
  });
});
