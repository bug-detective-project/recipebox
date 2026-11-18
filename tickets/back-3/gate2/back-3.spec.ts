import { expect, test } from '@playwright/test';
import { createRecipe, listRecipes, SAMPLE } from '../../../support/app.ts';

const NOT_FOUND = { error: 'Recipe not found' };

test.describe('Ticket back-3: deleting a recipe that does not exist is a 404', () => {
  test('an id that never existed answers 404', async ({ request }) => {
    const response = await request.delete('/api/recipes/999999');

    expect(response.status()).toBe(404);
    expect(await response.json()).toEqual(NOT_FOUND);
  });

  test('the second delete of the same recipe answers 404', async ({ request }) => {
    const recipe = await createRecipe(request);

    expect((await request.delete(`/api/recipes/${recipe.id}`)).status()).toBe(204);
    const again = await request.delete(`/api/recipes/${recipe.id}`);

    expect(again.status()).toBe(404);
    expect(await again.json()).toEqual(NOT_FOUND);
  });

  for (const id of ['abc', '1.5', '0', '-3']) {
    test(`the id "${id}" answers 404`, async ({ request }) => {
      const response = await request.delete(`/api/recipes/${id}`);

      expect(response.status()).toBe(404);
      expect(await response.json()).toEqual(NOT_FOUND);
    });
  }

  test('a delete that answers 404 removes nothing', async ({ request }) => {
    const before = (await listRecipes(request)).map((recipe) => recipe.id);

    await request.delete('/api/recipes/999999');
    await request.delete('/api/recipes/abc');

    expect((await listRecipes(request)).map((recipe) => recipe.id)).toEqual(before);
  });

  test('a recipe that exists is still deleted with 204 and an empty body', async ({ request }) => {
    const response = await request.delete(`/api/recipes/${SAMPLE.toastie}`);

    expect(response.status()).toBe(204);
    expect(await response.text()).toBe('');
    expect((await request.get(`/api/recipes/${SAMPLE.toastie}`)).status()).toBe(404);
    expect((await listRecipes(request)).map((recipe) => recipe.title)).not.toContain('Cheese Toastie');
  });
});
