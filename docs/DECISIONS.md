# Architecture decisions

ADR-style log. Newest at the bottom. Add an entry before adding a dependency or
changing a rule in `CLAUDE.md`. Every "as of" date is when the source was
checked.

## 1. Static site generation with React Router framework mode (over Next 16, Astro, TanStack Start, and `vite-react-ssg`)

**Context.** Puffer's public sites need prerendered HTML and a complete SEO
head, on the org's Vite + React stack. The first attempt used
`vite-react-ssg` on top of the plain SPA template. Its npm README (checked
2026-09-22) says: "React Router v7 now has built-in SSG support. If you are
using React Router v7, we recommend using its official SSG capabilities …
`vite-react-ssg` will continue to maintain SSG functionality for React Router
v6 users." It also needed a patch to work with React Router 7 at all.

**Decision.** React Router **8** framework mode with `ssr: false` and
`prerender: true` (`react-router.config.ts`, `appDirectory: 'src'`). React
Router 8.4 is the current major (v7 receives security updates only, per the
v8 release blog) and `@react-router/dev` declares `vite ^7 || ^8`. Routes live
in `src/routes.ts`; each route module exports its component plus `meta` and
`links`. Output is static HTML in `build/client`, served by Vercel.

**Consequences.** Pages hydrate fully (no partial hydration, no RSC). Mobile
Total Blocking Time is a ceiling the framework does not lift, so performance
discipline is a per-PR rule (docs/PERFORMANCE.md). `react-router-dom` is gone
in v8; import from `react-router`. Route modules are the one place default
exports are allowed.

## 2. Vitest over Jest

**Decision.** Vitest reuses `vite.config.ts` (aliases, SCSS injection, CSS
modules) with no transform layer; its `projects` feature hosts the SEO
contract test (Node) next to the component tests (jsdom). Vitest 5 supports
Vite 8. Divergence from the org's SPA template is called out in `CLAUDE.md`.

## 3. Head management: React Router `meta`/`links`, not a head library

**Context.** The first draft used `@unhead/react`. React Router's route-module
docs render `meta`/`links` into the prerendered `<head>` and note that "since
React 19, using the built-in `<meta>` element is recommended over the use of
the route module's `meta` export"; Unhead has no React Router integration.

**Decision.** `src/seo/page-meta.ts` builds the descriptor arrays (title,
description, robots, OG/Twitter, JSON-LD via `"script:ld+json"`, canonical,
hreflang); route modules return them from `meta()`/`links()`. `root.tsx`'s
`meta` covers client-side 404s. No head library.

## 4. Semantic token layer over a raw palette; no design-system package

**Context.** The org's `@pufferfinance/puffer-ui-components` was removed from
this template (September 2026): it pulled Google Fonts, ~70 legacy variables
and react-aria into every consumer, and the team plans to grow its own
component library from `components/ui`.

**Decision.** `src/styles/palette.scss` holds the raw brand scale;
`src/styles/tokens.scss` maps it to semantic tokens (`--color-*`, `--space-*`,
`--text-*`, `--radius-*`, `--shadow-*`, `--z-*`, `--duration-*`) with dark
mode under `[data-theme="dark"]` and `prefers-color-scheme`. `helpers.scss`
(breakpoint mixins, `spacing()`) is injected into every stylesheet. Stylelint
enforces token-only values and confines palette names to `tokens.scss`.
`docs/TOKENS.md` is generated from these three files.

## 5. No Tailwind, no shadcn/ui, no JS animation libraries, no CSS-in-JS

SCSS modules + tokens only. Motion is CSS inside
`@media (prefers-reduced-motion: no-preference)`. No `"use client"` (no RSC).

## 6. `components/ui` is a library in waiting

**Decision.** `src/components/ui/**` may import only React,
`react-aria-components` and sibling ui modules (ESLint `no-restricted-imports`
enforces it). No `@/…` app modules, no router, no i18n, no network, no
content. Its only contract with the app is the CSS custom properties in
`tokens.scss`. This is what lets the folder be extracted into
`@pufferfinance/ui` later without rewrites.

## 7. Headless accessibility: react-aria-components for interactive widgets

**Context.** Accessible dialogs, menus, tabs, comboboxes and tooltips need
focus management, roving tabindex, typeahead and ARIA state that are easy to
get subtly wrong. Options: hand-roll everything, or a headless library.
`react-aria-components` 1.21.1 (checked 2026-09-22) declares React 19 peers,
ships no styles ("React Aria does not include any styles by default"), exposes
state via data attributes (`data-pressed`, `data-focus-visible`) and supports
SSR.

**Decision.** Use react-aria-components (RAC) as the base for interactive ui
components, starting with `ui/button`. Purely structural components
(Container, Section, VisuallyHidden, SkipLink) stay native. `root.tsx` mounts
RAC's `RouterProvider` so RAC `Link`s navigate client-side. Never add a second
headless kit.

**Consequences.** Use `onPress`/`isDisabled`, not `onClick`/`disabled`, on
RAC-based components. Bundle cost is per component and tree-shaken (RAC
Button in the consent banner: +12 kB gzip on the initial chunk); heavy
widgets go behind `LazySection`.

## 8. Bundle budget: initial JS 150 kB gzip

React DOM 19 + React Router 8 + i18next are ~120 kB gzip before app code;
150 kB leaves headroom for the shell (per-route chunk 60 kB, CSS 40 kB).
Enforced by `pnpm build` (`scripts/check-bundle-size.ts`). A ceiling, not a
target: the example page ships 145 kB (133 kB before react-aria-components).

## 9. Fonts: Inter for text, Russo One and Saira Condensed for the game UI

On Lighthouse's mobile preset every pending web font delays the text LCP until
it arrives. Inter (latin, variable, 48 kB WOFF2) carries the body copy. The
Volt game UI (§ 13) uses Russo One (one weight, 7 kB latin) for headlines,
numbers and buttons, and Saira Condensed 600 (18 kB latin) for labels. Both
ship latin and latin-ext subsets so č, ć, š, ž and đ render; the Russo One
latin file is preloaded with Inter because it renders the h1. The 3D scene
paints its screens and boards with the same two faces.

## 10. Tooling audit (2026-09-22): replacements made

Each package's npm registry data, README and issue tracker were checked for
deprecation or "use X instead" notices.

| Removed                          | Replaced by                                            | Why (source)                                                                                               |
| -------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| `vite-react-ssg`                 | React Router 8 prerender                               | README notice recommends RR's own SSG; needed a patch for RR7                                              |
| `@unhead/react`                  | RR `meta`/`links`                                      | RR renders head at build; React 19 built-ins recommended (reactrouter.com route-module docs)               |
| `vite-plugin-sitemap`            | `scripts/lib/finalize-static-build.ts` (RR `buildEnd`) | last release 2025-05, tested against Vite 5; sitemap now derived from the prerendered pages' `robots` meta |
| `beasties`                       | plain render-blocking stylesheets                      | RR emits `<link rel=stylesheet>`; 7 kB CSS costs less than the async-swap repaint it caused                |
| `@lhci/cli`                      | `lighthouse` 13 via `scripts/lighthouse.ts`            | LHCI 0.15.1 (2025-06) pins Lighthouse 12.6.1; Lighthouse 13 issue open since 2026-04                       |
| `vitest-axe`                     | `vi-axe`                                               | stable 0.1.0 from 2022, prerelease depends on Vitest 3 internals; vi-axe 1.1.0 (2026-08) targets Vitest 5  |
| `eslint` 9                       | `eslint` 10                                            | ESLint's support page lists 9.x as EOL since 2026-08-06                                                    |
| `eslint-plugin-import`           | `eslint-plugin-import-x`                               | original has no ESLint 10 peer; import-x is e18e's recommended replacement                                 |
| `eslint-plugin-react`            | `@eslint-react/eslint-plugin`                          | maintainer: "explicitly not compatible with eslint 10" (issue #3977)                                       |
| `stylelint-config-prettier-scss` | removed                                                | parent config archived: "no longer necessary" since Stylelint 15                                           |
| `@vitejs/plugin-react`           | RR's Vite plugin                                       | framework mode provides the React transform                                                                |

Kept with a note: `eslint-plugin-jsx-a11y` (works on ESLint 10 per maintainer,
peer range not yet widened → `peerDependencyRules` in `pnpm-workspace.yaml`);
`@testing-library/user-event` (maintenance mode but the right tool for jsdom
tests); `tsx` (Node 24 native type stripping needs explicit `.ts` extensions
in imports, which the codebase does not use); `rollup-plugin-visualizer` 7.1
(fixed for Vite 8/rolldown); `jsdom` (axe does not run on happy-dom);
`sass-embedded`, `vite-imagetools` 12 (requires Vite 8), `msw`, Playwright.

## 11. Data fetching: no library until there is data

**Context.** The org used SWR. As of 2026-09-22 SWR's latest stable is 2.5.1
(2024-08-12) with only a 2.6.0 beta since (2024-09); TanStack Query 5.103.2
was released 2026-09 and declares `react ^18 || ^19`.

**Decision.** The template ships no data library: a static marketing site has
little client-side data, and `api/` (typed fetchers over `fetch`) + a hook per
endpoint (`hooks/fetch`) is enough for a "latest posts" widget. When caching,
revalidation or request de-duplication is actually needed, add **TanStack
Query**, not SWR, and keep the `api/` → `hooks/` → `domain/` layering so MSW
integration tests stay unchanged. Record it here when you do.

## 12. Hosting on Vercel: static output, headers in `vercel.json`

`outputDirectory: build/client`, `cleanUrls`, no trailing slash. Security
headers (CSP, HSTS, frame-ancestors, referrer, permissions) live in
`vercel.json` and are mirrored on the Vite dev server; a unit test keeps both
identical. CSP keeps `'unsafe-inline'` for scripts because React Router
injects inline hydration data and the pre-paint theme script; nonces are not
possible on static hosting. Unknown URLs are served `404.html`
(copied from React Router's `404/index.html` at build end).
`scripts/preview.ts` (`pnpm preview`) mimics this locally: clean URLs,
`404.html` with a 404 status, the same headers, immutable asset caching and
gzip, so Playwright and Lighthouse measure what Vercel serves. Vite's preview
and `sirv` were rejected: neither compresses or serves `404.html`, which
turned a 2.4 s mobile LCP into 4 s in measurements.

## 13. One look: Volt, a floodlit night stadium

The portfolio is told as a matchday walk-out at Poljud, with a game UI picked
from four directions in a style lab (Gold Foil, Neon Arena, Volt, Prism):
**Volt**, street-football energy. Acid lime is the brand colour, electric blue
the accent (darkened to keep white text at ≥ 4.5:1), on near-black cards.
Buttons, tags and stat tiles are skewed blocks (`--skew`) with hard offset
shadows; cards are solid with a coloured edge and a stripe texture
(`ui/panel`). The site has a single dark theme; the template's colour-mode
context, theme toggle and pre-paint theme script were removed with the consent
banner and analytics (there are no cookies or third-party scripts).

## 14. three.js for the 3D stadium, as its own lazy chunk

`three` (+ `@types/three`) renders the Poljud scene: procedural bowl, shell
roofs, instanced crowd (bounce in the vertex shader), LED textures painted on
canvases, and an `EffectComposer` with `UnrealBloomPass` + `OutputPass` for the
floodlight glow. No React wrapper (`@react-three/fiber`): the scene is one
imperative controller (`stadium-scene/lib/create-stadium.ts`) behind a small
component, which keeps React out of the render loop.

The scene chunk is ~146 kB gzip (November 2026, after the realism pass in
§ 18), so the 150 kB scene budget has little room left: new scene features
must pay for themselves. It is imported dynamically after the page is
idle, so it never touches the initial-JS budget, LCP or TBT of the prerendered
text. It gets its own 150 kB budget in `scripts/check-bundle-size.ts`; every
other lazy chunk keeps the 60 kB limit. While the chunk loads, and without
WebGL, `TunnelBackdrop` (an inline SVG of the tunnel, in the prerendered HTML)
stands in; its lamps switch on one by one while loading and the 3D canvas
fades in over it. The copy is identical either way.

## 15. Projects as a starting XI

Projects are presented as a football squad, not a list: eleven starters in a
4-3-3 and a bench. Positions carry meaning so the metaphor explains itself:
goalkeeper = the most trust-critical system, defence = backend,
infrastructure and safety, midfield = whole products run end to end, attack =
the newest, most visible work. No more than three starters come from one
employer, so the portfolio reads as Marin's work rather than one company's.

Structure lives in `content/squad.ts`: `startingXi` in shirt order (team sheet,
squad screen, scout-report pager) and `introOrder` for the walk-out (each line
right to left, keeper first, striker last). Copy is in the `squad` namespace
(cards, home page) and `scout` (scout reports only, kept out of the initial
bundle). Cards say what each project _is_; why it plays in its position stays
on the scout report, where there is room for the metaphor. `stadium-scene/lib/timeline.ts` is the single
source for chapter timing, read by both the hero's chapters and the camera
path, so panels and camera moves cannot drift apart. Each starter has a
prerendered scout report at `/projects/<slug>` (`react-router.config.ts`
`prerender` reads the asset-free `content/squad-slugs.ts`); its canonical
link travels in `meta`, because `links` gets no route params.

`LinkButton` stays a plain anchor: react-aria's `Link` would add ~11 kB to the
initial chunk for client-side routing the prerendered pages do not need.

## 16. Head coach and a plain profile for recruiters

Marin is the team's head coach ("Inter Faces"), introduced after the eleven
players and before the squad screen. His card shows a trophy cabinet of real,
checkable highlights instead of self-rated skill scores, which recruiters
read as noise. Under the stadium, `CoachProfile` repeats the essentials as
plain text (about, transfer history from the CV, skill groups): the 30-second
read for recruiters, and what search engines and link previews see. The
header's "Profile" link jumps straight there.

## 17. Camera: one direction, angle blending, holds

After the walk-out every shot faces west (−x): line-up from the attacking
end, close-ups, coach, squad and full time, so the camera turns once instead
of flipping between ends. Each close-up stands behind the player on the line
to the west big screen, so the project on the screen is always in frame (a
unit test projects player and screen through the real camera for all eleven).

The view direction is blended as yaw/pitch with a monotone (Fritsch–Carlson)
spline (`camera-aim.ts`) rather than by moving the aim point along its own
spline, so long moves never whip round or overshoot. The render loop caps the
turn speed (`MAX_TURN_SPEED`); reduced motion snaps. Keys can `hold`: the
camera stays still for the middle `HOLD_SHARE` of each player's scroll and
eases between holds, so a small accidental scroll changes nothing.

Portrait phones see only about ±15° across, so the landscape close-up (player
in the left third) would leave him out of frame. `create-stadium.ts` builds a
second path with the `PORTRAIT` framing (player centred, aim dropped so his
upper body sits mid-screen, big screen above) and uses it whenever the canvas
is taller than wide; on phones the cards become compact bottom sheets.

Navigation reads the same timeline: `STOPS` in `matchday-hero/lib/stage.ts`
lists every place the walk-out rests (each chapter, each player's hold). The
chapter rail's buttons and the tunnel's "Skip to the squad" link jump to a
stop, and ← / → step between stops while the stadium is on screen. The skip
link is a real `#squad` anchor, so it also works without JavaScript. Scout
reports link back to where the visitor left: `/#player-<slug>` (or `/#squad`
when opened from the squad screen, via router state); the hero maps the hash
to its stop with `stopForHash`, jumps there instantly and drops the hash.

## 18. Realism pass on the scene

Players and the coach share one low-poly human (`build-figure.ts`): tapered
torso, capsule limbs, neck, hair, varied skin and hair. Fans got shaped bodies,
hair and shading jitter; the grass a bump map; the tunnel concrete panels, a
rubber floor and LED strips; the roofs soft additive floodlight beams. The
post chain renders with 4× MSAA (off on low-power devices), then a NaN guard,
bloom, output and a broadcast grade (gentle S-curve, vignette, grain).

The NaN guard matters: one non-finite pixel (a GPU `pow()` or bump-map edge
case) spreads through the bloom blur and blacks out the whole frame on real
GPUs while software renderers, used for screenshots, hide it. Clamp inputs to
`pow()` in custom shaders as well.

## 19. Two languages: English and Croatian

English lives at `/`, Croatian under `/hr` with the same pages. The locale
comes from the URL only (`localeOf` in `seo/hreflang.ts`); the browser
language detector was removed, because a detect-once instance kept the wrong
language after client navigation between `/` and `/hr`. `i18nFor(locale)`
returns the default instance or a clone sharing one resource store, and
`root.tsx` provides the matching instance and sets `<html lang>`.

Croatian copy loads only on Croatian pages: `routes/home/home-hr.tsx` and
`routes/project/project-hr.tsx` register the `hr` JSON and re-export the
English page components, so the English initial bundle does not grow.
Internal links go through `useLocalizedPath`. Every indexable page lists
`x-default`, `en` and `hr` alternates, and the SEO contract checks each one
exists. The 404 page is English only (`hasAlternates: false`).

Stat values that are words (e.g. "6 wk") can be translated per language under
`players.<slug>.values`; the content value is the fallback.

The dev server pre-bundles every client dependency up front
(`optimizeDeps.include` in `vite.config.ts`); one discovered mid-session
re-bundles and answers 504 "Outdated Optimize Dep", which leaves the page
without JavaScript.
