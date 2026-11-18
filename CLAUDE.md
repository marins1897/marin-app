# CLAUDE.md — Marin Samardžić portfolio (React Router SSG + three.js)

Guidance for Claude Code and any other agent working in this repository. Read
this file first; `docs/` holds the detail. `AGENTS.md` is a symlink to this
file.

## Purpose and shape

Marin Samardžić's portfolio, built on Puffer's frontend template: the home
page is a scroll-driven walk-out into a 3D Poljud stadium (three.js), with all
copy prerendered. The stack is the Vite +
React stack with **React Router 8 framework mode** doing static-site
generation (`ssr: false`, `prerender: true`): every route is rendered to HTML
at build time and served as static files from Vercel. Trade-off, accepted:
pages **hydrate fully** (no partial hydration, no RSC), so mobile Total
Blocking Time is a ceiling the framework does not lift and performance
discipline is a per-PR responsibility (§ Performance). Reasoning and the
September 2026 tooling audit: `docs/DECISIONS.md`.

`components/ui` is the seed of a future standalone component library
(§ Component architecture). Keep it extractable.

## Stack

| Concern          | Package                                                                                                                                                                             | Notes                                                                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| Framework        | `react-router@8` + `@react-router/dev`                                                                                                                                              | framework mode; `src/routes.ts`, route modules in `src/routes/<name>/`; import from `react-router` (there is no `react-router-dom` in v8) |
| Build / dev      | `vite@8` (Rolldown)                                                                                                                                                                 | `react-router dev` / `react-router build`; output `build/client`                                                                          |
| UI               | `react@19`, `react-dom`                                                                                                                                                             | `ref` is a prop; `use()` for context and promises                                                                                         |
| Headless a11y    | `react-aria-components`                                                                                                                                                             | base for interactive ui components (`ui/button`); `onPress`, `isDisabled`, data-attribute states                                          |
| Head / SEO       | React Router `meta`/`links` exports + `schema-dts`                                                                                                                                  | builders in `src/seo/page-meta.ts`; JSON-LD via `"script:ld+json"`                                                                        |
| Sitemap / robots | `scripts/lib/finalize-static-build.ts`                                                                                                                                              | RR `buildEnd` hook; derived from the prerendered pages' `robots` meta                                                                     |
| Images           | `vite-imagetools`                                                                                                                                                                   | `import img from './x.png?picture'` + `ui/picture`                                                                                        |
| Styling          | `sass-embedded`, SCSS modules                                                                                                                                                       | `src/styles/{palette,tokens,helpers,fonts}.scss`; helpers injected everywhere                                                             |
| i18n             | `i18next`, `react-i18next`                                                                                                                                                          | `en` at `/`, `hr` at `/hr`; locale from the URL only; a namespace per route, registered by the route module (DECISIONS § 19)              |
| Tests            | `vitest@5`, `@testing-library/*`, `vi-axe`, `msw`                                                                                                                                   | **Vitest, not Jest** (DECISIONS § 2)                                                                                                      |
| E2E / audits     | `@playwright/test`, `@axe-core/playwright`, `lighthouse@13`                                                                                                                         | projects: desktop, mobile, no-js; `scripts/lighthouse.ts`                                                                                 |
| Lint             | `eslint@10` flat config, `typescript-eslint`, `@eslint-react`, `eslint-plugin-jsx-a11y` strict, `eslint-plugin-import-x`, `stylelint@17` + `declaration-strict-value`, `prettier@3` | tokens, layering and ui isolation are lint rules                                                                                          |
| Hosting          | Vercel (`vercel.json`)                                                                                                                                                              | static, `cleanUrls`; security headers in `vercel.json` and mirrored on the dev server (a test keeps them equal)                           |

Node 24, pnpm 11. TypeScript 6 strict with `noUncheckedIndexedAccess` and
`verbatimModuleSyntax`. No data-fetching library yet (DECISIONS § 11: add
TanStack Query, not SWR, when real client data appears).

## Commands

```bash
pnpm install          # also regenerates docs/TOKENS.md (postinstall)
pnpm dev              # react-router dev (SSR dev server, http://localhost:5173)
pnpm build            # react-router build → build/client, sitemap/robots, bundle budgets
pnpm preview          # static server for build/client on http://localhost:4173
pnpm lint             # eslint + stylelint + prettier --check
pnpm lint:fix
pnpm typecheck        # react-router typegen + tsc -b
pnpm test             # vitest unit/component/integration + coverage
pnpm test:watch
pnpm test:seo         # SEO contract against build/client (after build)
pnpm test:e2e         # Playwright (starts preview itself)
pnpm lighthouse       # Lighthouse 13, every page, 3 runs, asserts targets; --desktop
pnpm analyze          # build with reports/bundle-stats.html
pnpm generate:tokens  # docs/TOKENS.md
pnpm validate         # typecheck + lint + test + build + test:seo
```

## Structure

```
react-router.config.ts  # appDirectory 'src', ssr false, prerender true, buildEnd
src/
├── root.tsx            # <html> Layout, router provider, header/main/footer, ErrorBoundary (404)
├── routes.ts           # THE route list (React Router RouteConfig)
├── routes/             # one folder per route: <name>/{<name>.tsx, .module.scss, .test.tsx, lib/}
├── api/                # typed fetchers, no React (http.ts is the only fetch caller)
├── components/
│   ├── ui/             # future library: React + react-aria-components + own SCSS only
│   └── domain/         # portfolio-specific, composes ui/ (matchday-hero, stadium-scene, panels)
├── content/            # typed structure + seo per page; copy lives in i18n
├── hooks/              # reusable hooks (fetch hooks under hooks/fetch)
├── i18n/               # i18next init + locales/<lng>/<namespace>.json
├── seo/                # site constants, buildPageMeta/buildPageLinks, JSON-LD, hreflang
├── styles/             # globals, palette, tokens, helpers, fonts
├── test/               # vitest setup, renderWithProviders, msw, axe helper
└── utils/              # pure helpers (+ csp-headers.ts)
tests/seo/              # SEO contract test (Node, reads build/client)
e2e/                    # Playwright specs
scripts/                # lighthouse, bundle budgets, token docs, static-build finalizer
docs/                   # DECISIONS, TOKENS (generated), TESTING, SEO, PERFORMANCE
```

One component per kebab-case folder: `name/{name.tsx, name.module.scss,
name.test.tsx, index.ts, lib/}`. PascalCase, **named exports only**; the
exceptions are React Router route modules (`src/routes/*.tsx`, `root.tsx`,
`routes.ts`) and config files, which export defaults by convention.

## Component architecture — checklist

- [ ] **`components/ui/` is a library in waiting.** It may import only React,
      `react-aria-components` and sibling `ui` modules (ESLint blocks
      everything else, including `@/…`). No router, no i18n, no fetching, no
      context, no `content/`, no app utils (its own helpers live in
      `ui/lib/`). Its only contract with the app is the CSS custom properties
      from `tokens.scss`. It must be movable to its own package without edits.
- [ ] ui props are presentational primitives only (`title`, `children`,
      `variant`, `size`, `href`, `onPress`, `icon`). No prop names a Puffer
      concept (`vault`, `apy`, `validator`, `restake`, `tvl`, `chain`). Text
      arrives rendered; links arrive as `href` or a `render`/`as` prop.
- [ ] Interactive ui components build on react-aria-components (DECISIONS § 7):
      never hand-roll focus management, keyboard handling or ARIA state that
      RAC provides. Structural components (Container, Section, VisuallyHidden,
      SkipLink) stay native.
- [ ] **`components/domain/` knows Puffer**: reads `content/`, calls
      `useTranslation`, uses hooks, composes `ui/`. Thin: data + translation +
      composition, layout CSS only to arrange children.
- [ ] Single responsibility, composition first; `variant` unions and slots
      over boolean-prop explosions; extend via `className`, `render`/`as`,
      composition, never a domain branch inside a ui component.
- [ ] Layers: domain → hooks → `api/` → `fetch`. Nothing imports upward
      (ESLint `import-x/no-restricted-paths`).
- [ ] Every exported component: explicit `interface XProps`, forwards
      `className`, forwards `ref` where it renders a DOM element.
- [ ] Accessibility is part of the contract: roles, names, keyboard, focus
      ring, `aria-*` state, `prefers-reduced-motion`, icons `aria-hidden`
      unless meaningful. Every ui test runs `axe`.

## Styling and tokens

- SCSS modules only. `src/styles/helpers.scss` (breakpoint mixins
  `@include mobile|tablet|desktop|desktop-lg`, `spacing($factor)`) is injected
  into every stylesheet Vite processes; never `@use` it in a module. Files
  reached only via `@use` from `globals.scss` (`tokens.scss`) import it
  explicitly.
- **Semantic tokens only** in components: `var(--color-*)`, `--space-{1..12}`,
  `--font-{display,body,mono}`, `--text-{xs..4xl}`, `--radius-*`, `--shadow-*`,
  `--container-max`, `--gutter`, `--focus-ring-width`, `--z-*`, `--duration-*`,
  `--ease-standard`. Look them up in **`docs/TOKENS.md`**. Palette names
  (`--primary-blue-50`, in `palette.scss`) are allowed only inside
  `tokens.scss`. Stylelint fails raw hex/rgb, px font sizes, magic z-index,
  and margins/paddings that are not tokens or `spacing()`.
- One look, a floodlit night stadium: tokens are defined once on `:root`
  with `color-scheme: dark` (DECISIONS § 13). No theme toggle.
- Class names kebab-case in SCSS, camelCase in TSX (`styles.heroTitle`).
- Motion: CSS only, inside `@media (prefers-reduced-motion: no-preference)`.
- Fonts: self-hosted WOFF2 subsets in `public/fonts/`, `font-display: swap`,
  metric-adjusted fallbacks, total under ~50 kB (DECISIONS § 9).

## SEO — adding a page

1. `src/routes.ts`: add `route('<slug>', 'routes/<slug>/<slug>.tsx')`.
2. `src/content/<slug>.ts` (structure + `seo`) and
   `src/i18n/locales/en/<slug>.json` (copy); register the namespace in
   `src/test/setup.ts`.
3. `src/routes/<slug>/<slug>.tsx`: `registerNamespace()` at module scope,
   `export const meta = () => buildPageMeta({ pathname, ...seo })`,
   `export const links = () => buildPageLinks(pathname)`, default component
   with exactly one `<h1>`.
4. OG image 1200×630 in `public/images/` (or keep the default).
5. Croatian version: `src/i18n/locales/hr/<slug>.json` plus a
   `routes/<slug>/<slug>-hr.tsx` module that registers it with `'hr'`, passes
   `locale: 'hr'` to `buildPageMeta`/`buildPageLinks` and re-exports the page
   component; add `route('hr/<slug>', …)`. Internal links use
   `useLocalizedPath`.
6. `pnpm typecheck && pnpm build && pnpm test:seo`. Playwright and Lighthouse
   pick the page up from the build output. Details: `docs/SEO.md`; guided:
   skill `add-page`.

## Performance rules (every PR)

- Initial chunk = header + hero only; the 3D scene is its own idle-loaded chunk (≤ 150 kB, DECISIONS § 14). Other interactive
  sections go behind `<LazySection load={() => import('…')}>` (prerendered,
  hydrated near the viewport). Static sections have no state or effects.
- Route modules are split automatically; each registers its own locale JSON.
- Budgets enforced by `pnpm build`: initial JS ≤ 150 kB gzip (DECISIONS § 8),
  other chunks ≤ 60 kB, CSS ≤ 40 kB. `pnpm analyze` shows what grew.
- Images via `?picture` + `ui/picture`; explicit dimensions; only the LCP image
  gets `priority` + `buildPicturePreload` in the route's `links`.
- No third-party scripts, cookies or analytics (so no consent banner).
- Targets (mobile preset, built output): Performance ≥ 90, LCP ≤ 2.5 s,
  CLS ≤ 0.1, TBT ≤ 200 ms; Accessibility/Best Practices/SEO = 100 (SEO is not
  asserted on `noindex` pages); desktop ≥ 95. See `docs/PERFORMANCE.md`.

## Testing conventions

Given / When / Then everywhere; one behaviour per `it`; three commented blocks
inside a test; query by role/label/text; no snapshots; mock only the network
(MSW). Route modules: render the default export with `renderWithProviders`
and assert `meta()`/`links()` as data. Full guide: `docs/TESTING.md`.

```ts
describe('ConsentBanner', () => {
  describe('given no consent decision is stored', () => {
    it('when the user accepts, then the decision is stored and the banner closes', async () => {
      // Given
      const user = userEvent.setup();
      renderWithProviders(<ConsentBanner />);
      await screen.findByRole('dialog');

      // When
      await user.click(screen.getByRole('button', { name: 'Accept' }));

      // Then
      expect(window.localStorage.getItem(CONSENT_STORAGE_KEY)).toBe('accepted');
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
```

## How to verify

1. `pnpm validate` — typegen + typecheck, lint (token and ui-isolation rules
   included), tests, build with budgets, SEO contract.
2. `pnpm test:e2e` — desktop, mobile and the no-JavaScript project (proves the
   prerender), axe on every page.
3. `pnpm lighthouse` — Lighthouse 13 against `pnpm preview`, mobile, 3 runs,
   asserts the targets. Cross-check interactively with the chrome-devtools MCP
   `lighthouse_audit` tool on `http://localhost:4173/` while `pnpm preview`
   runs, and `performance_start_trace` for LCP/TBT breakdowns.
4. For anything touching the initial chunk or SEO, delegate to the
   `seo-perf-auditor` agent.

## Agents, MCP servers, skills

- `.claude/agents/senior-frontend-dev.md` — component, route, hook and test
  authoring; reviews against the rules above.
- `.claude/agents/seo-perf-auditor.md` — after UI changes / before merging:
  builds, previews, runs Lighthouse + traces per page, reads the SEO contract
  output, reports gaps with concrete fixes.
- `.claude/skills/add-page/SKILL.md` — end-to-end route scaffolding.
- `.mcp.json`: `github`, `ESLint`, `figma`, `chrome-devtools` (Lighthouse,
  traces, console/network of the preview), `playwright`.
  `.claude/settings.json` allowlists read-only/build commands and runs
  prettier + eslint + stylelint `--fix` on edited `src/**` files.

## The 3D stadium

- `components/domain/stadium-scene/lib/` is plain TypeScript + three.js, one
  builder per part. `create-stadium.ts` assembles them and returns a small
  controller (`setFocus`, `dispose`); React never runs inside the render loop.
- Chapter timing lives in one place, `stadium-scene/lib/timeline.ts`; the hero's
  chapters (`matchday-hero/lib/stage.ts`) and the camera path both read it.
- Scroll progress reaches the scene through a ref (`hooks/use-scroll-progress`),
  chapters through state (`matchday-hero/lib/stage.ts`), so the page only
  re-renders when a chapter changes.
- Pure geometry (track, stand layout, camera path) is unit-tested; keep new
  geometry pure and tested the same way. The camera path must stay inside the
  bowl (`camera-path.test.ts`).
- Without hardware WebGL (software renderers included) the scene throws and the
  hero keeps its plain background; never make content depend on the scene.
- After the walk-out every shot faces west and close-ups aim at the west big
  screen (DECISIONS § 17); keep new camera keys consistent with that. View
  direction is blended as angles (`camera-aim.ts`), never by a target spline.
- Custom shaders: clamp `pow()` inputs; a NaN pixel blacks out the frame
  through the bloom on real GPUs (DECISIONS § 18). The scene chunk is near its
  150 kB budget.

## Do not

- Introduce Tailwind (any version), shadcn/ui or any other component kit,
  framer-motion or other JS animation libraries, Jest, CSS-in-JS, Next.js,
  `vite-react-ssg`, `react-snap`, `@prerenderer/*`, `@unhead/*`, SWR. No RSC
  here: never `"use client"`.
- Add default exports outside route modules and config files.
- Import anything but React, react-aria-components or sibling ui modules in
  `components/ui/`; put a domain prop there; or hand-roll a widget RAC
  provides.
- Use raw colours, px font sizes or magic spacing/z-index in SCSS; touch
  palette names outside `tokens.scss`.
- Add a dependency without an entry in `docs/DECISIONS.md`.
- Soften a failed gate: a red budget, SEO contract, axe or Lighthouse
  assertion is a blocker.

## Pointers

`docs/DECISIONS.md` · `docs/TOKENS.md` · `docs/TESTING.md` · `docs/SEO.md` ·
`docs/PERFORMANCE.md` · `README.md`
