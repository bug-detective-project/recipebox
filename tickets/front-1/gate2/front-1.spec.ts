import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { createPublished, getRecipe, ingredientsShown } from '../../../support/app.ts';

const THREE = [
  { name: 'flour', quantity: 200, unit: 'g' },
  { name: 'sugar', quantity: 50, unit: 'g' },
  { name: 'cinnamon', quantity: 1, unit: 'tsp' },
];

async function openEditForm(page: Page, id: number): Promise<void> {
  await page.goto(`/recipes/${id}/edit`);
  await expect(page.getByTestId('ingredient-row')).toHaveCount(3);
}

async function save(page: Page, title: string): Promise<void> {
  await page.getByRole('button', { name: 'Save recipe' }).click();
  await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
}

test.describe('Ticket front-1: an ingredient removed in the edit form stays removed', () => {
  test('the last ingredient is gone after the save', async ({ page, request }) => {
    const recipe = await createPublished(request, { ingredients: THREE });
    await openEditForm(page, recipe.id);

    await page.getByRole('button', { name: 'Remove ingredient 3' }).click();
    await expect(page.getByTestId('ingredient-row')).toHaveCount(2);
    await save(page, recipe.title);

    expect(await ingredientsShown(page)).toEqual(['200 g flour', '50 g sugar']);
    expect((await getRecipe(request, recipe.id)).ingredients.map((ingredient) => ingredient.name)).toEqual(['flour', 'sugar']);
  });

  test('an ingredient of the middle is gone, and the others are the same', async ({ page, request }) => {
    const recipe = await createPublished(request, { ingredients: THREE });
    await openEditForm(page, recipe.id);

    await page.getByRole('button', { name: 'Remove ingredient 2' }).click();
    await save(page, recipe.title);

    expect(await ingredientsShown(page)).toEqual(['200 g flour', '1 tsp cinnamon']);
    expect((await getRecipe(request, recipe.id)).ingredients.map(({ name, quantity, unit }) => ({ name, quantity, unit }))).toEqual([THREE[0], THREE[2]]);
  });

  test('two ingredients removed leave only the third, also after a reload', async ({ page, request }) => {
    const recipe = await createPublished(request, { ingredients: THREE });
    await openEditForm(page, recipe.id);

    await page.getByRole('button', { name: 'Remove ingredient 1' }).click();
    await page.getByRole('button', { name: 'Remove ingredient 1' }).click();
    await save(page, recipe.title);
    await page.reload();

    await expect(page.getByTestId('ingredient')).toHaveText(['1 tsp cinnamon']);
  });

  test('an ingredient removed and another added are both saved as the form shows', async ({ page, request }) => {
    const recipe = await createPublished(request, { ingredients: THREE });
    await openEditForm(page, recipe.id);

    await page.getByRole('button', { name: 'Remove ingredient 1' }).click();
    await page.getByRole('button', { name: 'Add ingredient' }).click();
    await page.getByRole('textbox', { name: 'Name of ingredient 3' }).fill('butter');
    await save(page, recipe.title);

    expect((await getRecipe(request, recipe.id)).ingredients.map((ingredient) => ingredient.name)).toEqual(['sugar', 'cinnamon', 'butter']);
  });

  test('a save without changes keeps every ingredient', async ({ page, request }) => {
    const recipe = await createPublished(request, { ingredients: THREE });
    await openEditForm(page, recipe.id);

    await save(page, recipe.title);

    expect(await ingredientsShown(page)).toEqual(['200 g flour', '50 g sugar', '1 tsp cinnamon']);
  });
});
