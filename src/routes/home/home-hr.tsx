import { homeContent } from '@/content/home';
import { registerNamespace } from '@/i18n/i18n';
import common from '@/i18n/locales/hr/common.json';
import notFound from '@/i18n/locales/hr/not-found.json';
import home from '@/i18n/locales/hr/home.json';
import profile from '@/i18n/locales/hr/profile.json';
import squad from '@/i18n/locales/hr/squad.json';
import { buildPageLinks, buildPageMeta } from '@/seo/page-meta';
import type { Route } from './+types/home-hr';

// The Croatian copy lives in this route's chunk only, so English pages never load it.
registerNamespace('common', common, 'hr');
// A dead link inside /hr renders the 404 in Croatian.
registerNamespace('not-found', notFound, 'hr');
registerNamespace('home', home, 'hr');
registerNamespace('squad', squad, 'hr');
registerNamespace('profile', profile, 'hr');

export const meta: Route.MetaFunction = () =>
  buildPageMeta({ pathname: '/', locale: 'hr', ...homeContent.seoHr });

export const links: Route.LinksFunction = () =>
  buildPageLinks('/', { locale: 'hr' });

export { default } from './home';
