import { expect, test } from '@playwright/test';

test.describe('Home page', () => {
  test('given a visitor with JavaScript, when the page loads, then it renders without console errors and hydrates', async ({
    page,
  }) => {
    // Given
    const errors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));

    // When
    await page.goto('/');

    // Then
    await expect(page.getByRole('heading', { level: 1 })).toHaveAccessibleName(
      'Marin Samardžić',
    );
    await expect(page.getByRole('link', { name: 'Download CV' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('given the home page, when the router navigates client-side to a missing URL, then the 404 page renders and focus moves to main', async ({
    page,
  }) => {
    // Given
    await page.goto('/');
    await page.getByRole('heading', { level: 1 }).waitFor();
    await page.waitForFunction(
      () =>
        document.querySelector('[data-status]')?.getAttribute('data-status') !==
        'loading',
    ); // hydrated and the scene has started (or reported no WebGL)

    // When: a client-side navigation (history API + popstate, what <Link> does)
    await page.evaluate(() => {
      window.history.pushState({}, '', '/does-not-exist');
      window.dispatchEvent(new PopStateEvent('popstate'));
    });

    // Then
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Offside!',
    );
    await expect(page).toHaveTitle('Offside: page not found | Marin Samardžić');
    await expect(page.locator('main')).toBeFocused();
  });

  test('given a direct request for an unknown URL, when served by preview, then the 404 page is returned', async ({
    page,
  }) => {
    // Given / When
    const response = await page.goto('/404');

    // Then
    expect(response?.ok()).toBe(true);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Offside!',
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
  });
});
