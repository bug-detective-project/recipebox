import { expect, test } from '@playwright/test';
import { createPublished, listRecipes, openList, titlesShown, uniqueTitle } from '../../../support/app.ts';

const titles = async (...args: Parameters<typeof listRecipes>) => (await listRecipes(...args)).map((recipe) => recipe.title);

test.describe('Ticket back-4: the search finds recipes without a photo', () => {
  test('a recipe without a photo is found by its title', async ({ request }) => {
    expect(await titles(request, { q: 'pasta' })).toEqual(['Garlic Butter Pasta']);
    expect(await titles(request, { q: 'toastie' })).toEqual(['Cheese Toastie']);
  });

  test('a recipe without a photo is found by its description', async ({ request }) => {
    expect(await titles(request, { q: 'weeknight' })).toEqual(['Garlic Butter Pasta']);
  });

  test('a search lists recipes with and without a photo together', async ({ request }) => {
    const found = await listRecipes(request, { q: 'lemon' });

    expect(found.map((recipe) => recipe.title)).toEqual(['Lemon Tart', 'Roast Chicken with Lemon']);
    expect(found[0]!.photo).toBeNull();
    expect(found[1]!.photo).not.toBeNull();
  });

  test('a recipe created without a photo is found right away', async ({ request }) => {
    const recipe = await createPublished(request, { title: uniqueTitle('QA Zucchini Fritters'), photo: null });

    expect(await titles(request, { q: 'zucchini' })).toEqual([recipe.title]);
  });

  test('what a photo shows is still searched', async ({ request }) => {
    expect(await titles(request, { q: 'bowl of oats' })).toEqual(['Overnight Oats']);
    expect(await titles(request, { q: 'paprika' })).toEqual(['Hummus']);
  });

  test('a search keeps the category filter', async ({ request }) => {
    expect(await titles(request, { q: 'lemon', category: 'dessert' })).toEqual(['Lemon Tart']);
    expect(await titles(request, { q: 'lemon', category: 'main' })).toEqual(['Roast Chicken with Lemon']);
  });

  test('each recipe is listed once', async ({ request }) => {
    const found = await titles(request, { q: 'a' });

    expect(new Set(found).size).toBe(found.length);
    expect(found.length).toBeGreaterThan(5);
  });

  test('the search box of the list shows a recipe without a photo', async ({ page }) => {
    await openList(page);

    await page.getByRole('searchbox', { name: 'Search' }).fill('toastie');

    await expect(page.getByTestId('recipe-card')).toHaveCount(1);
    expect(await titlesShown(page)).toEqual(['Cheese Toastie']);
  });
});
