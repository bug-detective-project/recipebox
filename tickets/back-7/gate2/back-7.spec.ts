import { expect, test } from '@playwright/test';
import { createRecipe, recipeInput, serverLog, uniqueTitle } from '../../../support/app.ts';

type Line = Record<string, unknown>;

/** The lines of the log about changes to this recipe. */
const changesOf = (recipeId: number): Line[] => serverLog().filter((line) => line.event === 'recipe.changed' && line.recipeId === recipeId);
/** Every line about a change to a recipe. */
const allChanges = (): Line[] => serverLog().filter((line) => line.event === 'recipe.changed');
const as = (cook: string) => ({ 'X-Cook': cook });

test.describe('Ticket back-7: the log says who changed each recipe', () => {
  test('creating a recipe writes a line with the action, the recipe and the cook', async ({ request }) => {
    const response = await request.post('/api/recipes', { data: recipeInput(), headers: as('Leo') });
    const recipe = await response.json();

    await expect.poll(() => changesOf(recipe.id), 'the log lines of the new recipe').toHaveLength(1);
    expect(changesOf(recipe.id)[0]).toMatchObject({ event: 'recipe.changed', action: 'created', recipeId: recipe.id, cook: 'Leo' });
  });

  test('editing, publishing and deleting write one line each, in order, with the cook of each request', async ({ request }) => {
    const recipe = await createRecipe(request);

    await request.put(`/api/recipes/${recipe.id}`, { data: recipeInput({ title: recipe.title }), headers: as('Marta') });
    await request.post(`/api/recipes/${recipe.id}/publish`, { headers: as('Bianca') });
    await request.delete(`/api/recipes/${recipe.id}`, { headers: as('Leo') });

    await expect.poll(() => changesOf(recipe.id).length).toBe(4);
    expect(changesOf(recipe.id).map(({ action, cook }) => ({ action, cook }))).toEqual([
      { action: 'created', cook: 'unknown' },
      { action: 'updated', cook: 'Marta' },
      { action: 'published', cook: 'Bianca' },
      { action: 'deleted', cook: 'Leo' },
    ]);
  });

  test('the line is written through the logger of the request: info level, with the id of the request', async ({ request }) => {
    const recipe = await createRecipe(request);
    await request.put(`/api/recipes/${recipe.id}`, { data: recipeInput({ title: recipe.title }), headers: as('Leo') });
    await expect.poll(() => changesOf(recipe.id).length).toBe(2);

    const line = changesOf(recipe.id)[1]!;
    expect(line.level).toBe(30);
    expect(line.reqId, 'reqId of the line').toBeTruthy();
    const incoming = serverLog().find((other) => other.msg === 'incoming request' && other.reqId === line.reqId) as { req?: { method?: string; url?: string } } | undefined;
    expect(incoming?.req).toMatchObject({ method: 'PUT', url: `/api/recipes/${recipe.id}` });
  });

  for (const name of ['', '   ', 'x'.repeat(41), '<script>', 'a;b', 'Leo_Smith']) {
    test(`a name that is not a name (${JSON.stringify(name.slice(0, 12))}) is logged as "unknown"`, async ({ request }) => {
      const recipe = await createRecipe(request);

      await request.put(`/api/recipes/${recipe.id}`, { data: recipeInput({ title: recipe.title }), headers: as(name) });

      await expect.poll(() => changesOf(recipe.id).length).toBe(2);
      expect(changesOf(recipe.id)[1]).toMatchObject({ action: 'updated', cook: 'unknown' });
    });
  }

  for (const name of ['Ana Maria', "D'Angelo", 'J. P. Souza-Lima', 'Cook 2', 'x'.repeat(40)]) {
    test(`the name ${JSON.stringify(name.slice(0, 20))} is logged as it is`, async ({ request }) => {
      const recipe = await createRecipe(request);

      await request.put(`/api/recipes/${recipe.id}`, { data: recipeInput({ title: recipe.title }), headers: as(name) });

      await expect.poll(() => changesOf(recipe.id).length).toBe(2);
      expect(changesOf(recipe.id)[1]).toMatchObject({ cook: name });
    });
  }

  test('a change that did not happen writes no line', async ({ request }) => {
    const recipe = await createRecipe(request);
    await expect.poll(() => changesOf(recipe.id).length).toBe(1);
    const before = allChanges().length;

    expect((await request.put('/api/recipes/999999', { data: recipeInput(), headers: as('Leo') })).status()).toBe(404);
    expect((await request.put(`/api/recipes/${recipe.id}`, { data: recipeInput({ title: '' }), headers: as('Leo') })).status()).toBe(400);
    expect((await request.post('/api/recipes', { data: recipeInput({ prepTime: 'soon' }), headers: as('Leo') })).status()).toBe(400);
    expect((await request.post('/api/recipes/999999/publish', { headers: as('Leo') })).status()).toBe(404);
    // A marker: once its line is in the log, the lines of the requests above would be there too.
    const marker = await createRecipe(request);
    await expect.poll(() => changesOf(marker.id).length).toBe(1);

    expect(allChanges()).toHaveLength(before + 1);
  });

  test('reading, rating and marking a favorite write no line', async ({ request }) => {
    const draft = await createRecipe(request);
    await request.post(`/api/recipes/${draft.id}/publish`);
    await expect.poll(() => changesOf(draft.id).length).toBe(2);
    const before = allChanges().length;

    await request.get('/api/recipes', { headers: as('Leo') });
    await request.get(`/api/recipes/${draft.id}`, { headers: as('Leo') });
    await request.post(`/api/recipes/${draft.id}/ratings`, { data: { stars: 5 }, headers: as('Leo') });
    await request.put(`/api/favorites/${draft.id}`, { headers: as('Leo') });
    const marker = await createRecipe(request);
    await expect.poll(() => changesOf(marker.id).length).toBe(1);

    expect(allChanges()).toHaveLength(before + 1);
  });

  test('the line never carries what the cook typed', async ({ request }) => {
    const title = uniqueTitle('QA Secret Sauce');
    const response = await request.post('/api/recipes', { data: recipeInput({ title, description: 'Do not share this.' }), headers: as('Leo') });
    const recipe = await response.json();
    await expect.poll(() => changesOf(recipe.id).length).toBe(1);

    const text = JSON.stringify(changesOf(recipe.id)[0]);
    expect(text).not.toContain(title);
    expect(text).not.toContain('Do not share');
    expect(text).not.toContain('tomato');
  });

  test('a change made on the screen is logged with the cook picked in the header', async ({ page, request }) => {
    const recipe = await createRecipe(request);
    await page.goto(`/recipes/${recipe.id}/edit`);
    await expect(page.getByRole('textbox', { name: 'Title' })).toHaveValue(recipe.title);

    await page.getByRole('combobox', { name: 'Cooking as' }).selectOption('Bianca');
    await page.getByRole('button', { name: 'Save recipe' }).click();
    await expect(page.getByRole('heading', { name: recipe.title, level: 1 })).toBeVisible();
    await page.getByRole('button', { name: 'Publish' }).click();
    await expect(page.getByRole('button', { name: 'Publish' })).toHaveCount(0);

    await expect.poll(() => changesOf(recipe.id).length).toBe(3);
    expect(changesOf(recipe.id).slice(1).map(({ action, cook }) => ({ action, cook }))).toEqual([
      { action: 'updated', cook: 'Bianca' },
      { action: 'published', cook: 'Bianca' },
    ]);
  });
});
