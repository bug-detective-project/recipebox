import { expect, test } from '@playwright/test';
import { createRecipe, getRecipe, recipeInput, SAMPLE } from '../../../support/app.ts';

const TIMES: [string, number][] = [
  ['45', 45],
  ['45min', 45],
  ['45 min', 45],
  ['1h', 60],
  ['1h30', 90],
  ['1h 30min', 90],
  ['2H15', 135],
];

test.describe('Ticket back-1: a preparation time is read the same way when creating and when editing', () => {
  for (const [prepTime, minutes] of TIMES) {
    test(`"${prepTime}" is ${minutes} minutes in a new recipe and in an edit`, async ({ request }) => {
      const created = await request.post('/api/recipes', { data: recipeInput({ prepTime }) });
      expect(created.status(), `POST with prepTime "${prepTime}"`).toBe(201);
      const recipe = await created.json();
      expect(recipe.prepMinutes).toBe(minutes);

      const edited = await request.put(`/api/recipes/${recipe.id}`, { data: recipeInput({ prepTime }) });
      expect(edited.status(), `PUT with prepTime "${prepTime}": ${await edited.text()}`).toBe(200);
      expect((await edited.json()).prepMinutes).toBe(minutes);
    });
  }

  for (const prepTime of ['soon', 'h30', '1h90', '0', '']) {
    test(`"${prepTime}" is refused with the same answer in both`, async ({ request }) => {
      const draft = await createRecipe(request);

      const created = await request.post('/api/recipes', { data: recipeInput({ prepTime }) });
      const edited = await request.put(`/api/recipes/${draft.id}`, { data: recipeInput({ prepTime }) });

      expect(created.status()).toBe(400);
      expect(edited.status()).toBe(400);
      const answer = await created.json();
      expect(Object.keys(answer.fields)).toEqual(['prepTime']);
      expect(await edited.json()).toEqual(answer);
      expect((await getRecipe(request, draft.id)).prepMinutes).toBe(30);
    });
  }

  test('a recipe of an hour and a half is saved again from its edit form', async ({ page, request }) => {
    await page.goto(`/recipes/${SAMPLE.chicken}/edit`);
    await expect(page.getByRole('combobox', { name: 'Hours' })).toHaveValue('1');
    await expect(page.getByRole('combobox', { name: 'Minutes' })).toHaveValue('30');

    await page.getByRole('textbox', { name: 'Description' }).fill('Saved again by the QA suite.');
    await page.getByRole('button', { name: 'Save recipe' }).click();

    await expect(page.getByRole('heading', { name: 'Roast Chicken with Lemon', level: 1 })).toBeVisible();
    await expect(page.getByText('Saved again by the QA suite.')).toBeVisible();
    expect((await getRecipe(request, SAMPLE.chicken)).prepMinutes).toBe(90);
  });

  test('the edit form takes a new time written with hours', async ({ page, request }) => {
    const draft = await createRecipe(request);
    await page.goto(`/recipes/${draft.id}/edit`);

    await page.getByRole('combobox', { name: 'Hours' }).selectOption('2');
    await page.getByRole('combobox', { name: 'Minutes' }).selectOption('5');
    await page.getByRole('button', { name: 'Save recipe' }).click();

    await expect(page.getByRole('heading', { name: draft.title, level: 1 })).toBeVisible();
    expect((await getRecipe(request, draft.id)).prepMinutes).toBe(125);
  });
});
