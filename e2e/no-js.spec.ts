import { expect, test } from '@playwright/test';
import { listPrerenderedPages } from './lib/prerendered';

const pages = listPrerenderedPages();

/** Runs only in the `no-js` project: proves the prerendered HTML is complete. */
for (const prerendered of pages) {
  test(`given JavaScript is disabled, when ${prerendered.pathname} loads, then the full page content is already in the HTML`, async ({
    page,
  }) => {
    // Given / When
    await page.goto(prerendered.pathname);

    // Then
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('contentinfo')).toBeVisible();
    await expect(
      page.getByRole('navigation', {
        name: prerendered.pathname.startsWith('/hr')
          ? 'Glavna navigacija'
          : 'Main navigation',
      }),
    ).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(
      page.locator('script[type="application/ld+json"]').first(),
    ).toBeAttached();
  });
}
