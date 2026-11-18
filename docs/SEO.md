# SEO checklist

Everything here is enforced by `pnpm test:seo` (tests/seo/seo-contract.test.ts)
against the built `build/client`. If you add a page and the test passes, the
page is SEO-complete.

## Single source of truth

`src/routes.ts` lists every route; React Router prerenders each static path
(`prerender: true`). Everything that runs after the build (sitemap, robots,
Lighthouse, Playwright, the SEO contract) reads the prerendered HTML via
`scripts/lib/prerendered-pages.ts`, so a page cannot be forgotten.

## Adding a page

1. `src/routes.ts`: `route('restake', 'routes/restake/restake.tsx')`.
2. `src/content/restake.ts`: typed structure + `seo` (title ≤ 60 chars
   including " | Puffer", description ≤ 160, optional `ogImage` 1200×630 under
   `public/images/`, `noindex` for legal pages).
3. `src/i18n/locales/en/restake.json` (copy) and register it in
   `src/test/setup.ts`.
4. `src/routes/restake/restake.tsx`: `registerNamespace('restake', json)` at module
   scope, `export const meta = () => buildPageMeta({ pathname, ...seo,
breadcrumbs })`, `export const links = () => buildPageLinks(pathname)`, a
   default component with exactly one `<h1>`.
5. `pnpm typecheck` (generates `+types`), `pnpm build && pnpm test:seo`.

Or run the `add-page` skill (`.claude/skills/add-page/SKILL.md`).

## Languages

English at `/`, Croatian under `/hr` (DECISIONS § 19). `buildPageMeta` and
`buildPageLinks` take the unprefixed pathname plus `locale`; they emit the
localized canonical and `og:url`, `og:locale`, localized breadcrumbs, and the
`x-default`/`en`/`hr` alternates. The SEO contract checks `<html lang>` per
page and that every alternate points at a prerendered page. A Croatian page
needs its own `-hr` route module so its copy stays out of English bundles.

## Per page (rendered into the HTML by React Router)

- `<title>`: `%s | Puffer`, home page without suffix (`documentTitle`).
- `meta description`, `robots` (`index, follow` / `noindex, nofollow`),
  `theme-color` (light and dark). `charset` and `viewport` come from
  `root.tsx`'s `Layout`.
- `<link rel="canonical">`: absolute, from `SITE_URL` in `src/seo/site.ts`.
  Policy: no trailing slash except the root. The sitemap uses the same helper.
- Open Graph: `og:type`, `og:site_name`, `og:title`, `og:description`,
  `og:url`, `og:image` (absolute, 1200×630), `og:image:width/height/alt`.
- Twitter: `twitter:card=summary_large_image`, `twitter:site`,
  `twitter:title/description/image/image:alt`.
- JSON-LD (`src/seo/json-ld.ts`, typed with `schema-dts`, emitted as
  `"script:ld+json"` descriptors): `Organization` + `WebSite` on the home
  page, `WebPage` everywhere, `BreadcrumbList` on nested pages.
- `hreflang`: `x-default` + one `alternate` per locale, emitted automatically
  once `LOCALES` in `src/seo/site.ts` has more than one entry.

## Build outputs (`build/client`)

- `index.html`, `<route>/index.html` per route, plus a root `404.html` (copy
  of `404/index.html`) that Vercel serves for unknown URLs.
- `sitemap.xml` (indexable pages only, `lastmod`) and `robots.txt`
  (allow all, `Sitemap:` line), written by the `buildEnd` hook.
- `site.webmanifest`, favicons (SVG + PNG set + apple-touch-icon) from
  `public/`.

## Client-side navigation

React Router swaps `meta`/`links` on navigation; `root.tsx` moves focus to
`<main>`. Client-side 404s render the root `ErrorBoundary` with the
not-found page's meta.

## Verifying by hand

- `pnpm build && pnpm preview`, view source: the head must be complete
  without JavaScript.
- `pnpm test:e2e --project=no-js` renders every page with JavaScript off.
- Google Rich Results Test for the JSON-LD of a new page type.
