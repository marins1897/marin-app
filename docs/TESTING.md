# Testing

Every test answers "what would break if this were wrong?". If the answer is
nothing, delete it. No snapshot tests. No implementation details (state values,
internal calls). Query by role, label or text; never by class or test id unless
there is no accessible alternative.

## Given / When / Then

`describe` blocks state the component and the _given_ context; `it` titles
read _when …, then …_. Inside a test, three separated blocks: `// Given`,
`// When`, `// Then`. One behaviour per `it`.

```ts
describe('ConsentBanner', () => {
  describe('given no consent decision is stored', () => {
    it('when the page loads, then the banner is visible and focus is not stolen', async () => {
      // Given / When
      const { container } = renderWithProviders(<ConsentBanner />);

      // Then
      const dialog = await screen.findByRole('dialog', { name: 'Cookie preferences' });
      expect(dialog).toBeVisible();
      expect(dialog).not.toContainElement(document.activeElement as HTMLElement);
      expect(await axe(container)).toHaveNoViolations();
    });
  });

  describe('given consent was previously declined', () => {
    it('when the page loads, then the banner stays hidden', async () => {
      // Given
      window.localStorage.setItem(CONSENT_STORAGE_KEY, 'rejected');

      // When
      renderWithProviders(<ConsentBanner />);

      // Then
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
```

## Layers

| Layer        | Where                                 | Tooling                                                                                                              | Mocks                                    |
| ------------ | ------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Unit         | `src/utils`, `src/seo`, `src/content` | Vitest, Node/jsdom                                                                                                   | none                                     |
| Component    | `src/components/ui/**/*.test.tsx`     | RTL + user-event + `@/test/axe` (vi-axe)                                                                             | none: ui components have nothing to mock |
| Integration  | `src/components/domain`, `src/routes` | `renderWithProviders` (MemoryRouter, colour mode, consent, real `en` resources); `meta()`/`links()` asserted as data | network only, via MSW                    |
| SEO contract | `tests/seo/`                          | Vitest (Node) over `build/client`                                                                                    | none                                     |
| E2E          | `e2e/`                                | Playwright against `pnpm preview`: `desktop`, `mobile`, `no-js`                                                      | none                                     |

Commands: `pnpm test` (unit/component/integration with coverage),
`pnpm test:watch`, `pnpm test:seo` (after `pnpm build`), `pnpm test:e2e`.
Coverage is reported (`coverage/`), not gated. Gates are the SEO contract,
axe (component tests and every route in e2e) and Lighthouse CI.

## MSW

`src/test/msw/server.ts` starts a `msw/node` server in `src/test/setup.ts`
with `onUnhandledRequest: 'error'`: any request without a handler fails the
test. Add one handler per `src/api/` endpoint to `src/test/msw/handlers.ts`
and typed fixture builders under `src/test/fixtures/`. Override per test with
`server.use(http.get(url, () => HttpResponse.json(...)))`.

Rules: mock only at the network boundary. Never mock child components, hooks
you own, the design system or `fetch` directly. For fetching components cover
happy path, empty state, error state and loading state, and nothing else
unless a bug proves otherwise.

## Accessibility in tests

`@/test/axe` wraps `vi-axe` with colour contrast disabled (jsdom cannot
compute it); contrast is checked by `@axe-core/playwright` in
`e2e/a11y.spec.ts` on every route in both themes' default state. Component
tests assert roles, names, keyboard interaction and `aria-*` changes.

## Test doubles that exist

- `src/test/intersection-observer.ts`: deterministic IntersectionObserver
  (`intersectAll()` fires it), installed globally.
- `window.matchMedia` stub (always light) in `src/test/setup.ts`; i18n
  namespaces registered there with the real JSON files.
- `localStorage` is cleared after every test.
