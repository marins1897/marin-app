import { buildHreflangLinks, localizedPath } from './hreflang';
import {
  buildBreadcrumbJsonLd,
  buildPersonJsonLd,
  buildWebPageJsonLd,
  buildWebSiteJsonLd,
  type BreadcrumbItem,
} from './json-ld';
import {
  absoluteUrl,
  DEFAULT_LOCALE,
  DEFAULT_OG_IMAGE,
  DEFAULT_OG_IMAGE_ALT,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SITE_NAME,
  THEME_COLOR,
  type Locale,
} from './site';
import type { LinkDescriptor, MetaDescriptor } from 'react-router';

export const MAX_TITLE_LENGTH = 60;

const OG_LOCALE: Record<Locale, string> = { en: 'en_GB', hr: 'hr_HR' };
export const MAX_DESCRIPTION_LENGTH = 160;

export interface PageSeo {
  /** Page title without the site suffix. ≤ 60 chars including " | Marin Samardžić". */
  title: string;
  /** ≤ 160 chars. */
  description: string;
  /** Site-relative path to a 1200×630 image; defaults to the site image. */
  ogImage?: string;
  ogImageAlt?: string;
  /** Excludes the page from indexing and from the sitemap. */
  noindex?: boolean;
}

export interface PageMetaInput extends PageSeo {
  /** Site-relative pathname without a locale prefix, e.g. `/` or `/projects/x`. */
  pathname: string;
  /** The page's language; non-default locales live under `/xx`. */
  locale?: Locale;
  /** Breadcrumb trail for nested pages, starting at home. Omit on the home page. */
  breadcrumbs?: readonly BreadcrumbItem[];
}

/** Full document title: `%s | Marin Samardžić`, home page without the suffix. */
export const documentTitle = (title: string, pathname: string): string =>
  pathname === '/' ? title : `${title} | ${SITE_NAME}`;

/**
 * Everything a route's `meta` export needs: title, description, robots,
 * theme-color, Open Graph, Twitter and JSON-LD. Plain data, unit-tested
 * against fixed expectations. React Router renders it into `<head>` at build
 * time (prerender) and swaps it on client navigation.
 */
export const buildPageMeta = ({
  pathname,
  title,
  description,
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt = DEFAULT_OG_IMAGE_ALT,
  noindex = false,
  breadcrumbs,
  locale = DEFAULT_LOCALE,
}: PageMetaInput): MetaDescriptor[] => {
  const isHome = pathname === '/';
  const localPath = localizedPath(pathname, locale);
  const canonical = absoluteUrl(localPath);
  const image = absoluteUrl(ogImage);
  const fullTitle = documentTitle(title, pathname);
  const jsonLd = [
    ...(isHome ? [buildPersonJsonLd(), buildWebSiteJsonLd()] : []),
    buildWebPageJsonLd({ pathname: localPath, name: title, description }),
    ...(breadcrumbs && breadcrumbs.length > 0
      ? [
          buildBreadcrumbJsonLd(
            breadcrumbs.map((item) => ({
              ...item,
              pathname: localizedPath(item.pathname, locale),
            })),
          ),
        ]
      : []),
  ];

  return [
    { title: fullTitle },
    { name: 'description', content: description },
    {
      name: 'robots',
      content: noindex ? 'noindex, nofollow' : 'index, follow',
    },
    { name: 'theme-color', content: THEME_COLOR },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:title', content: fullTitle },
    { property: 'og:description', content: description },
    { property: 'og:url', content: canonical },
    { property: 'og:locale', content: OG_LOCALE[locale] },
    { property: 'og:image', content: image },
    { property: 'og:image:width', content: String(OG_IMAGE_WIDTH) },
    { property: 'og:image:height', content: String(OG_IMAGE_HEIGHT) },
    { property: 'og:image:alt', content: ogImageAlt },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: fullTitle },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: image },
    { name: 'twitter:image:alt', content: ogImageAlt },
    ...jsonLd.map((node) => ({ 'script:ld+json': node })),
  ];
};

/**
 * Canonical + hreflang for a route's `links` export. `pathname` has no locale
 * prefix; `hasAlternates: false` is for pages that exist in one language only.
 */
export const buildPageLinks = (
  pathname: string,
  {
    locale = DEFAULT_LOCALE,
    hasAlternates = true,
  }: { locale?: Locale; hasAlternates?: boolean } = {},
): LinkDescriptor[] => [
  { rel: 'canonical', href: absoluteUrl(localizedPath(pathname, locale)) },
  ...(hasAlternates ? buildHreflangLinks(pathname) : []),
];
