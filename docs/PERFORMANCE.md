# Performance discipline

This stack prerenders HTML with React Router but hydrates the whole page
(decision 1 in DECISIONS.md). Nothing in the framework keeps pages fast; these rules do. They
apply to every PR and `CLAUDE.md` repeats them.

## Targets (mobile Lighthouse preset, built output, median of 3 runs)

| Metric                             | Target                            | Enforced by                                   |
| ---------------------------------- | --------------------------------- | --------------------------------------------- |
| Performance                        | ≥ 90                              | `pnpm lighthouse` (CI `lighthouse` job)       |
| Accessibility, Best Practices, SEO | 100                               | same                                          |
| Largest Contentful Paint           | ≤ 2.5 s                           | same                                          |
| Cumulative Layout Shift            | ≤ 0.1                             | same                                          |
| Total Blocking Time                | ≤ 200 ms                          | same                                          |
| Desktop performance                | ≥ 95                              | `pnpm lighthouse --desktop` (manual)          |
| Initial JS on `/`                  | ≤ 150 kB gzip (see DECISIONS § 8) | `pnpm build` → `scripts/check-bundle-size.ts` |
| 3D stadium chunk (lazy, idle)      | ≤ 150 kB gzip                     | same; DECISIONS § 14                          |
| Any other JS chunk                 | ≤ 60 kB gzip                      | same                                          |
| Total CSS                          | ≤ 40 kB gzip                      | same                                          |

## Rules

1. **Ship the least JS.** Above the fold only the header, hero and consent
   banner may live in the initial chunk. Every other _interactive_ section goes
   behind `<LazySection load={() => import('…')} rootMargin="200px">`
   (`src/components/ui/lazy-section`): it is prerendered into the HTML, and its
   chunk is downloaded and mounted only when it nears the viewport. Purely
   static sections are rendered directly and must not carry state or effects.
2. **Route-level code splitting** is automatic: React Router loads each route
   module (and the locale JSON it registers) on demand.
3. **react-aria-components** is tree-shaken per component (`ui/button` costs
   ~10 kB gzip). Heavy widgets (Dialog, Menu, ComboBox) go behind
   `LazySection`, never in the initial chunk.
4. **Images**: everything under `src/assets/` goes through `vite-imagetools`
   (`import img from './x.png?picture'` → AVIF/WebP/PNG at 320–1280 px) and is
   rendered with `src/components/ui/picture`. Every `<img>` has `width`/`height`
   (or `aspect-ratio`). Below the fold: `loading="lazy"`, `decoding="async"`
   (the default). LCP image only: `priority` (eager, `fetchpriority="high"`)
   plus `buildPicturePreload(img, sizes)` in the route's `links` export.
5. **Fonts**: self-hosted in `public/fonts/`, `font-display: swap`, preload
   only the above-the-fold faces (index.html), and a `size-adjust`ed local
   fallback per face so the swap does not shift layout (below). Every pending
   web font delays the text LCP on slow mobile until it arrives, so keep the
   total under ~50 kB and ship WOFF2 subsets only (DECISIONS § 9).
6. **No layout shift from late content.** The consent banner is `position:
fixed`. Lazy sections reserve height with `minHeight`. Dynamic content
   renders a placeholder of the final size.
7. **Third-party scripts** (analytics) load only after consent and via
   `requestIdleCallback` (`src/components/domain/consent-gated-analytics`).
   Nothing third-party in the critical path.
8. **Motion**: CSS only, inside `@media (prefers-reduced-motion: no-preference)`.

## Fonts: how the fallback numbers were derived

`pnpm exec tsx scripts/measure-font-fallbacks.ts` prints the values used in
`src/styles/fonts.scss`:

- `size-adjust` = width of a fixed pangram rendered in Chromium with the web
  font ÷ width with the fallback font, at the same size and weight.
- `ascent-override` = web font `hhea.ascender` ÷ `unitsPerEm` ÷ size-adjust;
  `descent-override` uses `|hhea.descender|`; `line-gap-override` uses
  `hhea.lineGap`. The script reads these tables from the TTF/WOFF2 files.

Inter → Arial: size-adjust 107.08 %, ascent 90.47 %, descent 22.53 %,
line-gap 0 % (matches Fontaine's published values for Inter, which validates
the method). The rules are inlined into `<head>` at build time
(`vite.config.ts › inlineFontFaces`) so the first paint uses the adjusted
fallback.

## How to read the reports

- **Bundle analyzer**: `pnpm analyze` writes `reports/bundle-stats.html`
  (treemap, gzip sizes, client build only). Look for: a design-system import
  that dragged react-aria into the layout chunk; a locale JSON or page inside
  the entry; duplicated packages (two React copies).
- **Budget table**: `pnpm build` prints gzip sizes per chunk. "initial JS" =
  entry + every `modulepreload` in `build/client/index.html`.
- **Lighthouse**: `pnpm lighthouse` (`scripts/lighthouse.ts`) starts
  `pnpm preview`, runs Lighthouse 13 on every prerendered page 3 times (mobile
  preset with simulated throttling; `--desktop` for desktop), prints medians
  and fails on any missed target. JSON reports land in `reports/lighthouse/`.
  For a single interactive run use the chrome-devtools MCP `lighthouse_audit`
  tool against `http://localhost:4173/` while `pnpm preview` is running, and
  `performance_start_trace` for a TBT/LCP breakdown.
- **Known ceiling**: TBT is dominated by hydrating React + React Router on a
  4× CPU-throttled phone. Reduce hydration work (LazySection, fewer
  above-the-fold components) before reaching for anything else.
