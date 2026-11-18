import { useCallback } from 'react';
import { useLocation } from 'react-router';
import { localeOf, localizedPath } from '@/seo/hreflang';
import type { Locale } from '@/seo/site';

/** The current page's locale, from its URL prefix. */
export const useLocale = (): Locale => localeOf(useLocation().pathname);

/** Maps an unprefixed site path (`/projects/x`, `/#profile`) into the current locale. */
export const useLocalizedPath = (): ((path: string) => string) => {
  const locale = useLocale();
  return useCallback(
    (path: string) => {
      const [pathname = '/', hash] = path.split('#');
      const localized = localizedPath(pathname || '/', locale);
      return hash === undefined ? localized : `${localized}#${hash}`;
    },
    [locale],
  );
};
