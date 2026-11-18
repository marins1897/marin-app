import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { listPrerenderedPages } from './lib/prerendered';

const pages = listPrerenderedPages();

for (const prerendered of pages) {
  test(`given ${prerendered.pathname}, when scanned with axe, then there are no serious or critical violations`, async ({
    page,
  }) => {
    // Given
    await page.goto(prerendered.pathname);
    await page.getByRole('heading', { level: 1 }).waitFor();

    // When
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag22aa', 'best-practice'])
      .analyze();

    // Then
    const blocking = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    );
    expect(blocking, JSON.stringify(blocking, null, 2)).toEqual([]);
  });
}

test('given the home page, when the keyboard user tabs, then the skip link is first and jumps to main', async ({
  page,
}) => {
  // Given
  await page.goto('/');
  await page.getByRole('heading', { level: 1 }).waitFor();

  // When
  await page.keyboard.press('Tab');

  // Then
  const skipLink = page.getByRole('link', { name: 'Skip to main content' });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});
