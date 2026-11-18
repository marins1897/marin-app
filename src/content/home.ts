import type { PageSeo } from '../seo/page-meta';

/** A highlight in the coach's trophy cabinet; copy in `home.json` under `coach.trophies.<id>`. */
export type CoachTrophy = 'puffer-fi' | 'ai-agents' | 'amo-na-canj';

/** Home page data. Copy lives in `i18n/locales/<lng>/home.json`. */
export const homeContent = {
  seo: {
    title: 'Marin Samardžić · Fullstack Developer',
    description:
      'Fullstack developer for Web3, AI tooling and sport tech. Walk out at Poljud with Inter Faces: eleven projects, one per position, and me as coach.',
  } satisfies PageSeo,
  seoHr: {
    title: 'Marin Samardžić · Full-stack developer',
    description:
      'Full-stack developer za Web3, AI alate i sportsku tehnologiju. Izađi na Poljud s Inter Facesom: jedanaest projekata, jedan po poziciji, a ja sam trener.',
  } satisfies PageSeo,
  trophies: [
    'puffer-fi',
    'ai-agents',
    'amo-na-canj',
  ] satisfies readonly CoachTrophy[],
} as const;
