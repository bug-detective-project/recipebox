import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { openRecipe, SAMPLE } from '../../../support/app.ts';

/** Nothing of a recipe page is on screen. */
async function expectNoRecipe(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: 'Ingredients' })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Steps' })).toHaveCount(0);
  await expect(page.getByTestId('servings')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Delete' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Edit' })).toHaveCount(0);
}

test.describe('Ticket front-5: a recipe that does not exist is not an empty recipe', () => {
  for (const id of ['999999', 'abc']) {
    test(`/recipes/${id} says that the recipe was not found`, async ({ page }) => {
      await page.goto(`/recipes/${id}`);

      await expect(page.getByRole('heading', { name: 'Recipe not found' })).toBeVisible();
      await expectNoRecipe(page);
    });
  }

  test('the not found page leads back to the list', async ({ page }) => {
    await page.goto('/recipes/999999');
    await expect(page.getByRole('heading', { name: 'Recipe not found' })).toBeVisible();

    await page.getByRole('link', { name: 'Back to the recipes' }).click();

    await expect(page.getByTestId('recipe-card')).toHaveCount(12);
  });

  test('the edit form of a recipe that does not exist is not an empty form', async ({ page }) => {
    await page.goto('/recipes/999999/edit');

    await expect(page.getByRole('heading', { name: 'Recipe not found' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save recipe' })).toHaveCount(0);
  });

  test('a recipe deleted in the meantime says not found on a reload', async ({ page, request }) => {
    await openRecipe(page, SAMPLE.toastie, 'Cheese Toastie');
    expect((await request.delete(`/api/recipes/${SAMPLE.toastie}`)).status()).toBe(204);

    await page.reload();

    await expect(page.getByRole('heading', { name: 'Recipe not found' })).toBeVisible();
    await expectNoRecipe(page);
  });

  test('an answer that is an error of the server says that the recipe could not be loaded', async ({ page }) => {
    await page.route(`**/api/recipes/${SAMPLE.oats}`, (route) => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Internal server error' }) }));

    await page.goto(`/recipes/${SAMPLE.oats}`);

    await expect(page.getByRole('alert')).toContainText('could not be loaded');
    await expectNoRecipe(page);
    await expect(page.getByRole('heading', { name: 'Recipe not found' })).toHaveCount(0);
  });

  test('a recipe that exists is shown as before', async ({ page }) => {
    await openRecipe(page, SAMPLE.oats, 'Overnight Oats');

    await expect(page.getByTestId('ingredient')).toHaveCount(4);
    await expect(page.getByTestId('step')).toHaveCount(3);
  });
});
