import {
  absoluteUrl,
  DEFAULT_OG_IMAGE,
  PERSON_EMAIL,
  PERSON_JOB_TITLE,
  PERSON_LOCATION,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  SOCIAL_LINKS,
} from './site';
import type {
  BreadcrumbList,
  Person,
  WebPage,
  WebSite,
  WithContext,
} from 'schema-dts';

export const PERSON_ID = `${SITE_URL}/#person`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

export const buildPersonJsonLd = (): WithContext<Person> => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': PERSON_ID,
  name: SITE_NAME,
  jobTitle: PERSON_JOB_TITLE,
  email: `mailto:${PERSON_EMAIL}`,
  homeLocation: { '@type': 'Place', name: PERSON_LOCATION },
  url: `${SITE_URL}/`,
  image: absoluteUrl(DEFAULT_OG_IMAGE),
  sameAs: SOCIAL_LINKS.map((link) => link.href),
});

export const buildWebSiteJsonLd = (): WithContext<WebSite> => ({
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  description: SITE_DESCRIPTION,
  publisher: { '@id': PERSON_ID },
});

export interface WebPageInput {
  pathname: string;
  name: string;
  description: string;
}

export const buildWebPageJsonLd = ({
  pathname,
  name,
  description,
}: WebPageInput): WithContext<WebPage> => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  '@id': `${absoluteUrl(pathname)}#webpage`,
  url: absoluteUrl(pathname),
  name,
  description,
  isPartOf: { '@id': WEBSITE_ID },
  about: { '@id': PERSON_ID },
  inLanguage: 'en',
});

export interface BreadcrumbItem {
  name: string;
  pathname: string;
}

/** Ordered trail, first item is the home page. Use on nested pages only. */
export const buildBreadcrumbJsonLd = (
  items: readonly BreadcrumbItem[],
): WithContext<BreadcrumbList> => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(item.pathname),
  })),
});
