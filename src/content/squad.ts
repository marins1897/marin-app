import amoNaCanjPicture from '../assets/projects/amo-na-canj.png?picture';
import amoNaCanjScreen from '../assets/projects/amo-na-canj.png?screen';
import crossChainPicture from '../assets/projects/cross-chain.png?picture';
import crossChainScreen from '../assets/projects/cross-chain.png?screen';
import cryptoTodayPicture from '../assets/projects/cryptotoday.png?picture';
import cryptoTodayScreen from '../assets/projects/cryptotoday.png?screen';
import eSljedivostPicture from '../assets/projects/esljedivost.png?picture';
import eSljedivostScreen from '../assets/projects/esljedivost.png?screen';
import nkOskOtokPicture from '../assets/projects/nk-osk-otok.png?picture';
import nkOskOtokScreen from '../assets/projects/nk-osk-otok.png?screen';
import playgrndPicture from '../assets/projects/playgrnd.png?picture';
import playgrndScreen from '../assets/projects/playgrnd.png?screen';
import portfolioPicture from '../assets/projects/portfolio.png?picture';
import portfolioScreen from '../assets/projects/portfolio.png?screen';
import pufferAppPicture from '../assets/projects/puffer-app.png?picture';
import pufferAppScreen from '../assets/projects/puffer-app.png?screen';
import pufferFiPicture from '../assets/projects/puffer-fi.png?picture';
import pufferFiScreen from '../assets/projects/puffer-fi.png?screen';
import reneversePicture from '../assets/projects/reneverse.png?picture';
import reneverseScreen from '../assets/projects/reneverse.png?screen';
import type { PlayerSlug } from './squad-slugs';
import type { PictureSource } from '../components/ui/picture';

/** 4-3-3 positions, left/right from the team's own point of view. */
export type Slot =
  | 'GK'
  | 'RB'
  | 'RCB'
  | 'LCB'
  | 'LB'
  | 'DM'
  | 'RCM'
  | 'LCM'
  | 'RW'
  | 'ST'
  | 'LW';

/** Short position shown on badges; the full name is `positions.<label>` in i18n. */
export const POSITION_LABEL: Record<Slot, string> = {
  GK: 'GK',
  RB: 'RB',
  RCB: 'CB',
  LCB: 'CB',
  LB: 'LB',
  DM: 'DM',
  RCM: 'CM',
  LCM: 'CM',
  RW: 'RW',
  ST: 'ST',
  LW: 'LW',
};

export interface ProjectShot {
  /** Responsive screenshot for cards and scout reports. */
  picture: PictureSource;
  /** 1280px JPEG painted onto the stadium's big screens. */
  screen: string;
}

export interface PlayerStat {
  value: string;
  /** Key under `players.<slug>.stats` in the `squad` namespace. */
  labelKey: string;
}

export interface SquadPlayer {
  slug: PlayerSlug;
  number: string;
  slot: Slot;
  isCaptain?: boolean;
  /** Live site; internal paths are fine for this portfolio itself. */
  href?: string;
  /** Screenshot; alt text is `players.<slug>.imageAlt`. */
  shot?: ProjectShot;
  stats: readonly PlayerStat[];
  stack: readonly string[];
}

export type BenchSlug =
  | 'ap2-agent-payments'
  | 'azra-player'
  | 'telegram-mini-app'
  | 'mediiochain'
  | 'kavana-quiz';

export interface BenchPlayer {
  slug: BenchSlug;
  href?: string;
}

/**
 * The starting XI in shirt order (team sheet, squad screen, scout report pager).
 * Positions carry meaning: keeper = the most trust-critical system, defence =
 * backend, infrastructure and safety, midfield = whole products run end to
 * end, attack = the newest, most visible work. Copy lives in `squad.json`.
 */
export const startingXi: readonly SquadPlayer[] = [
  {
    slug: 'e-sljedivost',
    number: '1',
    slot: 'GK',
    href: 'https://esljedivost.mps.hr',
    shot: { picture: eSljedivostPicture, screen: eSljedivostScreen },
    stats: [
      { value: 'Gov', labelKey: 'client' },
      { value: 'QR', labelKey: 'lookup' },
      { value: 'HLF', labelKey: 'ledger' },
    ],
    stack: ['React', 'Material UI', 'd3.js', 'Hyperledger Fabric', 'Go'],
  },
  {
    slug: 'cross-chain-interop',
    number: '2',
    slot: 'RB',
    href: 'https://puffer-cross-chain-interop-frontend.vercel.app',
    shot: { picture: crossChainPicture, screen: crossChainScreen },
    stats: [
      { value: '3', labelKey: 'flows' },
      { value: '7702', labelKey: 'eip' },
      { value: 'L1↔L2', labelKey: 'chains' },
    ],
    stack: ['React', 'TypeScript', 'viem', 'wagmi', 'SCSS'],
  },
  {
    slug: 'ai-assistant',
    number: '3',
    slot: 'LB',
    stats: [
      { value: '31', labelKey: 'tools' },
      { value: '5', labelKey: 'layers' },
      { value: '2', labelKey: 'channels' },
    ],
    stack: [
      'Node.js',
      'TypeScript',
      'RAG',
      'pgvector',
      'Redis',
      'viem',
      'promptfoo',
    ],
  },
  {
    slug: 'reneverse',
    number: '4',
    slot: 'LCB',
    href: 'https://reneverse.tech',
    shot: { picture: reneversePicture, screen: reneverseScreen },
    stats: [
      { value: 'AWS', labelKey: 'serverless' },
      { value: 'GQL', labelKey: 'apis' },
      { value: 'SOL', labelKey: 'contracts' },
    ],
    stack: [
      'Node.js',
      'TypeScript',
      'GraphQL',
      'PostgreSQL',
      'AWS',
      'Solidity',
    ],
  },
  {
    slug: 'cryptotoday',
    number: '5',
    slot: 'RCB',
    href: 'https://cryptotoday.com',
    shot: { picture: cryptoTodayPicture, screen: cryptoTodayScreen },
    stats: [
      { value: 'REST', labelKey: 'api' },
      { value: 'PG', labelKey: 'database' },
      { value: 'AWS', labelKey: 'infra' },
    ],
    stack: ['TypeScript', 'Express', 'PostgreSQL', 'AWS', 'Docker'],
  },
  {
    slug: 'puffer-app',
    number: '6',
    slot: 'DM',
    href: 'https://app.puffer.fi',
    shot: { picture: pufferAppPicture, screen: pufferAppScreen },
    stats: [
      { value: 'ETH', labelKey: 'staked' },
      { value: 'pufETH', labelKey: 'token' },
      { value: 'dApp', labelKey: 'kind' },
    ],
    stack: ['React', 'TypeScript', 'wagmi', 'viem', 'Node.js'],
  },
  {
    slug: 'playgrnd',
    number: '7',
    slot: 'RW',
    href: 'https://playgrnd.app',
    shot: { picture: playgrndPicture, screen: playgrndScreen },
    stats: [
      { value: '9,000+', labelKey: 'players' },
      { value: '800+', labelKey: 'teams' },
      { value: '10k', labelKey: 'matches' },
    ],
    stack: ['Frontend', 'Integrations', 'AI'],
  },
  {
    slug: 'amo-na-canj',
    number: '8',
    slot: 'RCM',
    href: 'https://amonacanj.com',
    shot: { picture: amoNaCanjPicture, screen: amoNaCanjScreen },
    stats: [
      { value: '130', labelKey: 'teams' },
      { value: '5', labelKey: 'sports' },
      { value: '2', labelKey: 'days' },
    ],
    stack: ['React', 'TypeScript', 'Vite', 'Supabase Realtime'],
  },
  {
    slug: 'puffer-fi',
    number: '9',
    slot: 'ST',
    href: 'https://www.puffer.fi',
    shot: { picture: pufferFiPicture, screen: pufferFiScreen },
    stats: [
      { value: '6 wk', labelKey: 'staging' },
      { value: '120+', labelKey: 'tests' },
      { value: 'SSG', labelKey: 'rendering' },
    ],
    stack: ['React 19', 'React Router', 'Vite', 'GSAP', 'Vercel'],
  },
  {
    slug: 'nk-osk-otok',
    number: '10',
    slot: 'LCM',
    isCaptain: true,
    href: 'https://osk-client-ecru.vercel.app',
    shot: { picture: nkOskOtokPicture, screen: nkOskOtokScreen },
    stats: [
      { value: '2,300+', labelKey: 'matches' },
      { value: '7', labelKey: 'squads' },
      { value: '240+', labelKey: 'tests' },
    ],
    stack: ['Next.js', 'Payload CMS', 'Supabase', 'COMET API', 'GSAP'],
  },
  {
    slug: 'this-portfolio',
    number: '11',
    slot: 'LW',
    href: '/',
    shot: { picture: portfolioPicture, screen: portfolioScreen },
    stats: [
      { value: '3D', labelKey: 'stadium' },
      { value: '11', labelKey: 'players' },
      { value: '0', labelKey: 'cookies' },
    ],
    stack: ['React 19', 'React Router SSG', 'three.js', 'SCSS', 'Vitest'],
  },
];

/** Shirt numbers in walk-out order: each line right to left, keeper first, striker last. */
const INTRO_NUMBERS = [
  '1',
  '2',
  '5',
  '4',
  '3',
  '6',
  '8',
  '10',
  '7',
  '11',
  '9',
] as const;

/** The starting XI in the order the walk-out introduces them. */
export const introOrder: readonly SquadPlayer[] = INTRO_NUMBERS.flatMap(
  (number) => startingXi.filter((player) => player.number === number),
);

export const bench: readonly BenchPlayer[] = [
  { slug: 'ap2-agent-payments', href: 'https://unifi-ap2-demo.vercel.app' },
  {
    slug: 'azra-player',
    href: 'https://azra-player-h7an2oyl9-marins1897.vercel.app',
  },
  { slug: 'telegram-mini-app' },
  { slug: 'mediiochain' },
  { slug: 'kavana-quiz' },
];

export const findPlayer = (slug: string | undefined): SquadPlayer | undefined =>
  startingXi.find((player) => player.slug === slug);
