import { axe as runAxe } from 'vi-axe';

/**
 * axe for jsdom. Colour contrast needs a real layout engine, so it is checked
 * in the Playwright e2e run instead (see e2e/a11y.spec.ts).
 */
export const axe = (container: Element) =>
  runAxe(container, { rules: { 'color-contrast': { enabled: false } } });
