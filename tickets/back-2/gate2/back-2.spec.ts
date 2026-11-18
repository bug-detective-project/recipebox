import { expect, test } from '@playwright/test';
import { createRecipe, getRecipe, listRecipes, openRecipe, recipeInput, SAMPLE } from '../../../support/app.ts';

test.describe('Ticket back-2: the servings of a recipe are a number', () => {
  test('the list answers the servings as numbers', async ({ request }) => {
    const recipes = await listRecipes(request);

    expect(recipes).toHaveLength(12);
    for (const recipe of recipes) {
      expect(typeof recipe.servings, `servings of "${recipe.title}" (${JSON.stringify(recipe.servings)})`).toBe('number');
    }
    expect(recipes.find((recipe) => recipe.id === SAMPLE.pancakes)!.servings).toBe(4);
  });

  test('a recipe answers its servings as a number', async ({ request }) => {
    expect((await getRecipe(request, SAMPLE.chicken)).servings).toBe(6);
    expect((await getRecipe(request, SAMPLE.mugCake)).servings).toBe(1);
  });

  test('a new recipe and an edit save the servings as a number', async ({ request }) => {
    const created = await createRecipe(request, { servings: 3 });
    expect(created.servings).toBe(3);
    expect((await getRecipe(request, created.id)).servings).toBe(3);

    const edited = await request.put(`/api/recipes/${created.id}`, { data: recipeInput({ servings: 12 }) });
    expect(edited.status()).toBe(200);
    expect((await edited.json()).servings).toBe(12);
    expect((await getRecipe(request, created.id)).servings).toBe(12);
  });

  for (const servings of [0, -2, 101, 2.5, 'many', '4-6']) {
    test(`servings ${JSON.stringify(servings)} are refused`, async ({ request }) => {
      const response = await request.post('/api/recipes', { data: { ...recipeInput(), servings } });

      expect(response.status()).toBe(400);
      expect(Object.keys((await response.json()).fields)).toEqual(['servings']);
    });
  }

  test('one more serving on the recipe page is one more serving', async ({ page }) => {
    await openRecipe(page, SAMPLE.pancakes, 'Banana Pancakes');
    await expect(page.getByTestId('servings')).toHaveText('4 servings');

    await page.getByRole('button', { name: 'More servings' }).click();

    await expect(page.getByTestId('servings')).toHaveText('5 servings');
    await expect(page.getByTestId('ingredient').nth(2)).toHaveText('250 g flour');

    await page.getByRole('button', { name: 'More servings' }).click();
    await expect(page.getByTestId('servings')).toHaveText('6 servings');
    await expect(page.getByTestId('ingredient').nth(2)).toHaveText('300 g flour');
  });

  test('a recipe saved from the form scales by one serving at a time', async ({ page, request }) => {
    const draft = await createRecipe(request, { servings: 2, ingredients: [{ name: 'rice', quantity: 100, unit: 'g' }] });
    await page.goto(`/recipes/${draft.id}/edit`);
    await page.getByRole('spinbutton', { name: 'Servings' }).fill('5');
    await page.getByRole('button', { name: 'Save recipe' }).click();
    await expect(page.getByRole('heading', { name: draft.title, level: 1 })).toBeVisible();
    await expect(page.getByTestId('servings')).toHaveText('5 servings');

    await page.getByRole('button', { name: 'More servings' }).click();

    await expect(page.getByTestId('servings')).toHaveText('6 servings');
    await expect(page.getByTestId('ingredient')).toHaveText(['120 g rice']);
  });
});
