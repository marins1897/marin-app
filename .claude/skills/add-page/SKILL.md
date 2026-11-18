---
name: add-page
description: Add a new route/page end to end (routes.ts → content → i18n namespace → route module with meta/links → OG image → tests → SEO contract). Use when asked to add, create or scaffold a page or route.
---

# Add a page

Goal: a prerendered, SEO-complete, tested page. `pnpm test:seo` is the gate.

1. **Route** – add `route('<slug>', 'routes/<slug>/<slug>.tsx')` to `src/routes.ts`
   (nested: `route('parent', 'routes/parent/parent.tsx', [index(...), route(...)])`).
   Paths are lowercase with hyphens, no trailing slash.
2. **Content** – `src/content/<slug>.ts` exporting `<slug>Content` with `seo`
   (`title` ≤ 60 chars including " | Puffer", `description` ≤ 160, optional
   `ogImage: '/images/og-<slug>.png'`, `noindex: true` for legal pages) plus
   typed structure (lists, links, ids). Copy goes to i18n, not here.
3. **i18n** – `src/i18n/locales/en/<slug>.json`, camelCase keys grouped by
   section. Register it in `src/test/setup.ts` (`registerNamespace`).
4. **Route module** – `src/routes/<slug>/<slug>.tsx` (+ `<slug>.module.scss`,
   `<slug>.test.tsx`):
   ```tsx
   registerNamespace('<slug>', json); // module scope
   export const meta: Route.MetaFunction = () =>
     buildPageMeta({ pathname: '/<slug>', ...content.seo, breadcrumbs });
   export const links: Route.LinksFunction = () => buildPageLinks('/<slug>');
   export default function Page() {
     /* exactly one <h1> */
   }
   ```
   `import type { Route } from './+types/<slug>'` appears after `pnpm typecheck`
   (typegen). Compose `components/domain` sections; wrap below-the-fold
   interactive ones in `LazySection`; static ones render directly. Semantic
   tokens only in SCSS.
5. **OG image** – 1200×630 PNG in `public/images/`, referenced by
   `seo.ogImage`; otherwise the site default is used.
6. **Navigation** – if the page belongs in the header/footer, add it to
   `src/content/navigation.ts` and a label to `common.json`.
7. **Tests** – render the default export with `renderWithProviders`: one h1,
   key copy, `axe` from `@/test/axe`; assert `meta()` contains the title and
   robots descriptors and `links()` the canonical. Given/When/Then naming.
8. **Verify** –
   ```bash
   pnpm validate
   pnpm test:e2e
   ```
   `validate` typegens, builds and runs the SEO contract for every prerendered
   page (title, description, canonical, OG/Twitter, JSON-LD, sitemap, robots).
   The e2e `a11y` and `no-js` specs and `pnpm lighthouse` pick the page up from
   `build/client` automatically.
9. **Perf check** – if the page adds interactive sections or images, hand off
   to the `seo-perf-auditor` agent or run `pnpm lighthouse`.
