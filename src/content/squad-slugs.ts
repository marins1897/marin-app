/**
 * Starting XI slugs in shirt order. Kept free of asset imports so build config
 * (prerender list in react-router.config.ts) can read it without Vite.
 */
export const PLAYER_SLUGS = [
  'e-sljedivost',
  'cross-chain-interop',
  'ai-agents',
  'reneverse',
  'cryptotoday',
  'puffer-app',
  'playgrnd',
  'amo-na-canj',
  'puffer-fi',
  'nk-osk-otok',
  'this-portfolio',
] as const;

export type PlayerSlug = (typeof PLAYER_SLUGS)[number];

export const playerPath = (slug: PlayerSlug): string => `/projects/${slug}`;
