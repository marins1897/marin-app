import { absoluteUrl, DEFAULT_LOCALE, LOCALES, type Locale } from './site';
import type { LinkDescriptor } from 'react-router';

/** Path for a locale: the default locale has no prefix, others are `/xx/…`. */
export const localizedPath = (pathname: string, locale: Locale): string => {
  if (locale === DEFAULT_LOCALE) return pathname;
  return pathname === '/' ? `/${locale}` : `/${locale}${pathname}`;
};

const isLocale = (value: string | undefined): value is Locale =>
  LOCALES.some((locale) => locale === value);

/** The locale a path belongs to: its `/xx` prefix, or the default locale. */
export const localeOf = (pathname: string): Locale => {
  const prefix = pathname.split('/')[1];
  return isLocale(prefix) && prefix !== DEFAULT_LOCALE
    ? prefix
    : DEFAULT_LOCALE;
};

/** The path without its locale prefix: `/hr/projects/x` → `/projects/x`, `/hr` → `/`. */
export const unlocalizedPath = (pathname: string): string => {
  const locale = localeOf(pathname);
  if (locale === DEFAULT_LOCALE) return pathname;
  return pathname.slice(locale.length + 1) || '/';
};

/**
 * `x-default` + one `alternate` per locale, for an unprefixed `pathname`.
 * Returns nothing while the site has a single locale.
 */
export const buildHreflangLinks = (pathname: string): LinkDescriptor[] => {
  if (LOCALES.length < 2) return [];
  return [
    { rel: 'alternate', hrefLang: 'x-default', href: absoluteUrl(pathname) },
    ...LOCALES.map((locale) => ({
      rel: 'alternate',
      hrefLang: locale,
      href: absoluteUrl(localizedPath(pathname, locale)),
    })),
  ];
};
