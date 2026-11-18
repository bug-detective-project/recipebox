import { expect, test } from '@playwright/test';
import { createPublished, createRecipe, getRecipe, listRecipes, openRecipe, recipeInput, SAMPLE } from '../../../support/app.ts';

test.describe('Ticket back-6: editing a published recipe keeps it published, with its ratings', () => {
  test('an edit through the API keeps the status', async ({ request }) => {
    const response = await request.put(`/api/recipes/${SAMPLE.hummus}`, { data: recipeInput({ title: 'Hummus' }) });

    expect(response.status()).toBe(200);
    expect((await response.json()).status).toBe('published');
    expect((await getRecipe(request, SAMPLE.hummus)).status).toBe('published');
  });

  test('an edit through the API keeps the ratings', async ({ request }) => {
    const before = (await getRecipe(request, SAMPLE.curry)).rating;
    expect(before).toEqual({ average: 3.7, count: 3 });

    const response = await request.put(`/api/recipes/${SAMPLE.curry}`, { data: recipeInput({ title: 'Vegetable Curry' }) });

    expect((await response.json()).rating).toEqual(before);
    expect((await getRecipe(request, SAMPLE.curry)).rating).toEqual(before);
    expect((await listRecipes(request)).find((recipe) => recipe.id === SAMPLE.curry)).toMatchObject({ status: 'published', rating: before });
  });

  test('the edit form saves a published recipe and it stays published and rated', async ({ page, request }) => {
    await openRecipe(page, SAMPLE.pancakes, 'Banana Pancakes');
    await expect(page.getByTestId('rating-summary')).toContainText('4.7 (3 ratings)');
    await page.getByRole('link', { name: 'Edit' }).click();
    await expect(page.getByRole('textbox', { name: 'Title' })).toHaveValue('Banana Pancakes');

    await page.getByRole('textbox', { name: 'Description' }).fill('Edited by the QA suite.');
    await page.getByRole('button', { name: 'Save recipe' }).click();

    await expect(page.getByText('Edited by the QA suite.')).toBeVisible();
    await expect(page.getByTestId('rating-summary')).toContainText('4.7 (3 ratings)');
    await expect(page.getByRole('button', { name: 'Publish' })).toHaveCount(0);
    await expect(page.getByText('Draft', { exact: true })).toHaveCount(0);
    expect(await getRecipe(request, SAMPLE.pancakes)).toMatchObject({ status: 'published', rating: { average: 4.7, count: 3 } });
  });

  test('a recipe can be rated after an edit', async ({ request }) => {
    const recipe = await createPublished(request);
    expect((await request.post(`/api/recipes/${recipe.id}/ratings`, { data: { stars: 4 } })).status()).toBe(201);

    await request.put(`/api/recipes/${recipe.id}`, { data: recipeInput({ title: recipe.title }) });
    const rated = await request.post(`/api/recipes/${recipe.id}/ratings`, { data: { stars: 5 } });

    expect(rated.status()).toBe(201);
    expect(await rated.json()).toEqual({ average: 4.5, count: 2 });
  });

  test('a draft stays a draft when it is edited', async ({ request }) => {
    const draft = await createRecipe(request);

    const response = await request.put(`/api/recipes/${draft.id}`, { data: recipeInput({ title: draft.title }) });

    expect((await response.json()).status).toBe('draft');
  });

  test('a new recipe is still a draft, and publishing is still its own step', async ({ request }) => {
    const draft = await createRecipe(request);
    expect(draft.status).toBe('draft');

    const published = await request.post(`/api/recipes/${draft.id}/publish`);

    expect((await published.json()).status).toBe('published');
  });
});
