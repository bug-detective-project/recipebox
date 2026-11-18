import { expect, test } from '@playwright/test';
import { cardOf, createPublished, getRecipe, listRecipes, openList, openRecipe, SAMPLE, titlesShown } from '../../../support/app.ts';

const titles = async (...args: Parameters<typeof listRecipes>) => (await listRecipes(...args)).map((recipe) => recipe.title);

// In the sample cookbook the pancakes, the chicken and the mug cake are favorites.
test.describe('Ticket back-8: favorites work on the recipe page and as a filter of the list', () => {
  test('a recipe says whether it is a favorite', async ({ request }) => {
    expect((await getRecipe(request, SAMPLE.pancakes)).favorite).toBe(true);
    expect((await getRecipe(request, SAMPLE.pasta)).favorite).toBe(false);
  });

  test('the recipe follows the mark being put and taken away, like the list', async ({ request }) => {
    const recipe = await createPublished(request);
    const inList = async () => (await listRecipes(request)).find((item) => item.id === recipe.id)!.favorite;

    expect((await request.put(`/api/favorites/${recipe.id}`)).status()).toBe(204);
    expect((await getRecipe(request, recipe.id)).favorite).toBe(true);
    expect(await inList()).toBe(true);

    expect((await request.delete(`/api/favorites/${recipe.id}`)).status()).toBe(204);
    expect((await getRecipe(request, recipe.id)).favorite).toBe(false);
    expect(await inList()).toBe(false);
  });

  test('taking away a mark that is not there is not an error, and a missing recipe is a 404', async ({ request }) => {
    const recipe = await createPublished(request);

    expect((await request.delete(`/api/favorites/${recipe.id}`)).status()).toBe(204);
    expect((await request.delete(`/api/favorites/${recipe.id}`)).status()).toBe(204);
    const missing = await request.delete('/api/favorites/999999');
    expect(missing.status()).toBe(404);
    expect(await missing.json()).toEqual({ error: 'Recipe not found' });
  });

  test('favorites=true lists only the favorites, by title', async ({ request }) => {
    expect(await titles(request, { favorites: true })).toEqual(['Banana Pancakes', 'Chocolate Mug Cake', 'Roast Chicken with Lemon']);
  });

  test('favorites=true works together with the other filters', async ({ request }) => {
    expect(await titles(request, { favorites: true, category: 'dessert' })).toEqual(['Chocolate Mug Cake']);
    expect(await titles(request, { favorites: true, q: 'lemon' })).toEqual(['Roast Chicken with Lemon']);
    expect(await titles(request, { favorites: true, ingredient: 'egg' })).toEqual(['Banana Pancakes', 'Chocolate Mug Cake']);
    expect(await titles(request, { favorites: true, category: 'drink' })).toEqual([]);
  });

  test('favorites=false and no filter list everything', async ({ request }) => {
    const everything = await titles(request);
    expect(everything.length).toBeGreaterThanOrEqual(12);
    expect(await titles(request, { favorites: false })).toEqual(everything);
  });

  test('the heart of the recipe page shows the mark and changes it', async ({ page, request }) => {
    await openRecipe(page, SAMPLE.chicken, 'Roast Chicken with Lemon');
    const heart = page.getByRole('button', { name: 'Favorite Roast Chicken with Lemon' });
    await expect(heart).toHaveAttribute('aria-pressed', 'true');

    await heart.click();
    await expect(heart).toHaveAttribute('aria-pressed', 'false');
    expect((await getRecipe(request, SAMPLE.chicken)).favorite).toBe(false);

    await page.reload();
    await expect(page.getByRole('button', { name: 'Favorite Roast Chicken with Lemon' })).toHaveAttribute('aria-pressed', 'false');

    await page.getByRole('button', { name: 'Favorite Roast Chicken with Lemon' }).click();
    await expect(page.getByRole('button', { name: 'Favorite Roast Chicken with Lemon' })).toHaveAttribute('aria-pressed', 'true');
    expect((await getRecipe(request, SAMPLE.chicken)).favorite).toBe(true);
  });

  test('a recipe marked on its page is marked in the list', async ({ page }) => {
    await openRecipe(page, SAMPLE.hummus, 'Hummus');
    await page.getByRole('button', { name: 'Favorite Hummus' }).click();
    await expect(page.getByRole('button', { name: 'Favorite Hummus' })).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('link', { name: 'All recipes' }).click();

    await expect(cardOf(page, 'Hummus').getByRole('button', { name: 'Favorite Hummus' })).toHaveAttribute('aria-pressed', 'true');
  });

  test('"Only favorites" on the list shows the favorites', async ({ page, request }) => {
    await openList(page);

    // A click, not check(): the box follows the address, which changes a moment after the click.
    await page.getByRole('checkbox', { name: 'Only favorites' }).click();
    await expect(page.getByRole('checkbox', { name: 'Only favorites' })).toBeChecked();

    const favorites = await titles(request, { favorites: true });
    expect(favorites.length).toBeGreaterThanOrEqual(3);
    await expect(page.getByTestId('recipe-card')).toHaveCount(favorites.length);
    expect(await titlesShown(page)).toEqual(favorites);
    await expect(page.getByRole('alert')).toHaveCount(0);
  });
});
