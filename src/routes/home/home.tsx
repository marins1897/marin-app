import { MatchdayHero } from '@/components/domain/matchday-hero';
import { CoachProfile } from '@/components/domain/coach-profile';
import { homeContent } from '@/content/home';
import { registerNamespace } from '@/i18n/i18n';
import home from '@/i18n/locales/en/home.json';
import profile from '@/i18n/locales/en/profile.json';
import squad from '@/i18n/locales/en/squad.json';
import { buildPageLinks, buildPageMeta } from '@/seo/page-meta';
import type { Route } from './+types/home';

const PATHNAME = '/';

registerNamespace('home', home);
registerNamespace('squad', squad);
registerNamespace('profile', profile);

export const meta: Route.MetaFunction = () =>
  buildPageMeta({ pathname: PATHNAME, ...homeContent.seo });

export const links: Route.LinksFunction = () => buildPageLinks(PATHNAME);

/** Matchday at Poljud: the walk-out into the stadium, then the plain profile. */
export default function HomePage() {
  return (
    <>
      <MatchdayHero />
      <CoachProfile />
    </>
  );
}
