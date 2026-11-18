import { env } from '../utils/env';

/**
 * Site-wide SEO constants. `SITE_URL` is the single source for every absolute
 * URL (canonical, og:url, sitemap). Policy: no trailing slash, except the root.
 */
export const SITE_URL = (
  env.siteUrl ?? 'https://marin-portfolio1897.vercel.app'
).replace(/\/+$/, '');
export const SITE_NAME = 'Marin Samardžić';
export const SITE_DESCRIPTION =
  'Fullstack developer for Web3, AI tooling and sport tech. React, TypeScript, Node.js and Solidity.';
export const PERSON_JOB_TITLE = 'Fullstack Developer';
export const PERSON_EMAIL = 'marinsamardzic17@gmail.com';
export const PERSON_LOCATION = 'Sinj, Croatia';
export const DEFAULT_OG_IMAGE = '/images/og-default.jpg';
export const DEFAULT_OG_IMAGE_ALT =
  'Marin Samardžić, fullstack developer, in a floodlit night stadium';
export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;
export const THEME_COLOR = '#050b1c';
export const CV_PATH = '/cv/marin-samardzic-cv.pdf';

export const SOCIAL_LINKS = [
  { id: 'github', label: 'GitHub', href: 'https://github.com/marins1897' },
  {
    id: 'linkedin',
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/marinsamardzic1897',
  },
] as const;

export const LOCALES = ['en', 'hr'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';
/** Each language's own name, for the language switch. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  hr: 'Hrvatski',
};

/** Absolute URL for a site path. `/` → `SITE_URL/`, `/about` → `SITE_URL/about`. */
export const absoluteUrl = (pathname: string): string => {
  const normalized =
    pathname === '/' ? '/' : `/${pathname.replace(/^\/+|\/+$/g, '')}`;
  return `${SITE_URL}${normalized}`;
};
