import { index, route, type RouteConfig } from '@react-router/dev/routes';

/**
 * THE route list. React Router prerenders every static path here
 * (`prerender: true` in react-router.config.ts); sitemap, Lighthouse, the
 * SEO contract and e2e derive their lists from the prerendered output.
 *
 * Adding a page: add a `route()` here, create `routes/<name>/<name>.tsx` with a
 * default component plus `meta`/`links` built from `content/<name>.ts`, and
 * run `pnpm build && pnpm test:seo`. See docs/SEO.md.
 */
export default [
  index('routes/home/home.tsx'),
  // Scout reports: one prerendered page per starting XI player (see
  // react-router.config.ts `prerender`).
  route('projects/:slug', 'routes/project/project.tsx'),
  // Croatian: the same pages under /hr, each with its own copy chunk.
  route('hr', 'routes/home/home-hr.tsx'),
  route('hr/projects/:slug', 'routes/project/project-hr.tsx'),
  // Prerendered to build/client/404.html, which Vercel serves for unknown URLs.
  // Client-side navigation to an unknown URL renders root.tsx's ErrorBoundary.
  route('404', 'routes/not-found/not-found.tsx'),
] satisfies RouteConfig;
