import { finalizeStaticBuild } from './scripts/lib/finalize-static-build.ts';
import { PLAYER_SLUGS, playerPath } from './src/content/squad-slugs.ts';
import type { Config } from '@react-router/dev/config';

export default {
  appDirectory: 'src',
  buildDirectory: 'build',
  // Static site: every route is prerendered to HTML at build time and the
  // whole page hydrates in the browser. No runtime server.
  ssr: false,
  // Static paths, plus one scout report per player and language.
  prerender: ({ getStaticPaths }) => [
    ...getStaticPaths(),
    ...PLAYER_SLUGS.map(playerPath),
    ...PLAYER_SLUGS.map((slug) => `/hr${playerPath(slug)}`),
  ],
  // Small static site: ship the whole route manifest instead of fetching
  // `/__manifest` on navigation.
  routeDiscovery: { mode: 'initial' },
  // Sitemap and robots.txt are derived from the prerendered HTML (the
  // `robots` meta decides what is indexable), so routes cannot be forgotten.
  buildEnd: async ({ reactRouterConfig }) => {
    await finalizeStaticBuild(`${reactRouterConfig.buildDirectory}/client`);
  },
} satisfies Config;
