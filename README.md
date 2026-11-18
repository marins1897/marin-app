# Marin Samardžić · Portfolio

My portfolio, told as a matchday at Poljud: scroll walks you out of the
players' tunnel into a floodlit 3D stadium, and the camera tours the ground
while the big screens, LED boards and broadcast panels show who I am, my
projects and how to reach me. The projects are a starting XI with a scout
report each, I'm the head coach, and a plain profile (about, career, skills)
sits under the stadium for anyone in a hurry. In English at `/` and Croatian
at `/hr`.

React 19 + React Router 8 (prerendered to static HTML) on Vite 8, TypeScript,
SCSS modules on a semantic token layer, and three.js for the stadium. Built on
Puffer's frontend template, so it keeps its gates: Vitest, Playwright, axe,
an SEO contract and bundle budgets. Every word is in the prerendered HTML; the
3D scene loads lazily and is skipped without a GPU.

## Setup

Requires Node 24 and pnpm 11 (`corepack enable` or the version in
`packageManager`).

```bash
pnpm install
pnpm dev
```

`pnpm dev` runs the React Router dev server on <http://localhost:5173>.

## Verify

```bash
pnpm validate      # typegen + typecheck + lint + tests + build (budgets) + SEO contract
pnpm test:e2e      # Playwright: desktop, mobile, no-JavaScript
pnpm preview       # serve build/client on http://localhost:4173
pnpm lighthouse    # Lighthouse 13, every page, asserts targets (--desktop for desktop)
```

Playwright needs a browser once: `pnpm exec playwright install chromium`.

## Deploy

Vercel, static: `vercel.json` sets `outputDirectory` to `build/client`,
`cleanUrls`, security headers (CSP, HSTS, frame-ancestors) and immutable
caching for assets and fonts. Unknown URLs get `404.html`. The GitHub Actions
workflow (`.github/workflows/main.yaml`) runs on pull requests and pushes to
`main`.

## Where things are

- `CLAUDE.md` (also `AGENTS.md`): the working contract for humans and agents.
- `docs/DECISIONS.md`: why this shape, including the September 2026 tooling
  audit; `docs/TOKENS.md`: every design token; `docs/TESTING.md`,
  `docs/SEO.md`, `docs/PERFORMANCE.md`.
- `src/routes.ts`: the route list. Adding a page: `docs/SEO.md`.
- `src/components/domain/matchday-hero/`: the scroll story (chapters, panels).
- `src/components/domain/coach-profile/`: the plain-text profile under the
  stadium; career and skills data in `src/content/profile.ts`.
- `src/i18n/locales/{en,hr}/`: all copy, one JSON per namespace and language.
- `src/components/domain/stadium-scene/lib/`: the 3D stadium, one module per
  part (track geometry, bowl, shells, crowd, tunnel, signage, camera path,
  bloom).
- `public/cv/marin-samardzic-cv.pdf`: the CV behind "Download CV".
