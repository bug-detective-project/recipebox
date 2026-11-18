import { expect, test } from '@playwright/test';
import { listRecipes, openList, titlesShown } from '../../../support/app.ts';

const titles = async (...args: Parameters<typeof listRecipes>) => (await listRecipes(...args)).map((recipe) => recipe.title);

test.describe('Ticket back-5: the ingredient filter works together with the other filters', () => {
  test('alone, it lists every recipe with the ingredient', async ({ request }) => {
    expect(await titles(request, { ingredient: 'egg' })).toEqual(['Banana Pancakes', 'Chocolate Mug Cake', 'Egg Custard', 'Lemon Tart']);
  });

  test('with a category, only the recipes of that category are listed', async ({ request }) => {
    expect(await titles(request, { ingredient: 'egg', category: 'dessert' })).toEqual(['Chocolate Mug Cake', 'Egg Custard', 'Lemon Tart']);
    expect(await titles(request, { ingredient: 'egg', category: 'breakfast' })).toEqual(['Banana Pancakes']);
    expect(await titles(request, { ingredient: 'egg', category: 'drink' })).toEqual([]);
  });

  test('with a search, only the recipes the search finds are listed', async ({ request }) => {
    expect(await titles(request, { ingredient: 'garlic' })).toEqual(['Garlic Butter Pasta', 'Hummus', 'Roast Chicken with Lemon', 'Vegetable Curry']);
    expect(await titles(request, { ingredient: 'garlic', q: 'chicken' })).toEqual(['Roast Chicken with Lemon']);
  });

  test('with "Only favorites", only the favorites are listed', async ({ request }) => {
    expect(await titles(request, { ingredient: 'egg', favorites: true })).toEqual(['Banana Pancakes', 'Chocolate Mug Cake']);
    expect(await titles(request, { ingredient: 'egg', favorites: true, category: 'dessert' })).toEqual(['Chocolate Mug Cake']);
  });

  test('every filter at once', async ({ request }) => {
    expect(await titles(request, { ingredient: 'lemon', category: 'main', q: 'sunday' })).toEqual(['Roast Chicken with Lemon']);
    expect(await titles(request, { ingredient: 'lemon', category: 'dessert', q: 'sunday' })).toEqual([]);
  });

  test('an ingredient no recipe has gives an empty list, whatever the category', async ({ request }) => {
    expect(await titles(request, { ingredient: 'saffron' })).toEqual([]);
    expect(await titles(request, { ingredient: 'saffron', category: 'main' })).toEqual([]);
  });

  test('the category alone still works', async ({ request }) => {
    expect(await titles(request, { category: 'breakfast' })).toEqual(['Banana Pancakes', 'Overnight Oats']);
  });

  test('on the list, a category and an ingredient narrow the cards together', async ({ page }) => {
    await openList(page);

    await page.getByRole('combobox', { name: 'Category' }).selectOption('dessert');
    await expect(page.getByTestId('recipe-card')).toHaveCount(3);
    await page.getByRole('searchbox', { name: 'Ingredient' }).fill('lemon');

    await expect(page.getByTestId('recipe-card')).toHaveCount(1);
    expect(await titlesShown(page)).toEqual(['Lemon Tart']);
  });
});
