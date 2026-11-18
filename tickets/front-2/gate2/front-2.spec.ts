import { expect, test } from '@playwright/test';
import type { Page, Request } from '@playwright/test';
import { createPublished, getRecipe, uniqueTitle } from '../../../support/app.ts';

/** Records the requests that would save a recipe. */
function savesOf(page: Page): Request[] {
  const saves: Request[] = [];
  page.on('request', (request) => {
    if (request.url().includes('/api/recipes') && (request.method() === 'POST' || request.method() === 'PUT')) {
      saves.push(request);
    }
  });
  return saves;
}

async function fillNewRecipe(page: Page, title: string): Promise<void> {
  await page.goto('/recipes/new');
  await page.getByRole('textbox', { name: 'Title' }).fill(title);
  await page.getByRole('textbox', { name: 'Preparation time' }).fill('10 min');
  await page.getByRole('textbox', { name: 'Step 1' }).fill('Serve.');
}

const message = (page: Page) => page.getByText(/at least one ingredient/i);

test.describe('Ticket front-2: a recipe without ingredients is not saved', () => {
  test('a new recipe with no ingredient is refused by the form, with a message', async ({ page }) => {
    const saves = savesOf(page);
    await fillNewRecipe(page, uniqueTitle('QA Nothing'));

    await page.getByRole('button', { name: 'Remove ingredient 1' }).click();
    await expect(page.getByTestId('ingredient-row')).toHaveCount(0);
    await page.getByRole('button', { name: 'Save recipe' }).click();

    await expect(message(page)).toBeVisible();
    await expect(page).toHaveURL(/\/recipes\/new$/);
    expect(saves).toHaveLength(0);
  });

  test('a saved recipe keeps its ingredients when the cook removes all of them and saves', async ({ page, request }) => {
    const recipe = await createPublished(request);
    const saves = savesOf(page);
    await page.goto(`/recipes/${recipe.id}/edit`);
    await expect(page.getByTestId('ingredient-row')).toHaveCount(2);

    await page.getByRole('button', { name: 'Remove ingredient 1' }).click();
    await page.getByRole('button', { name: 'Remove ingredient 1' }).click();
    await page.getByRole('button', { name: 'Save recipe' }).click();

    await expect(message(page)).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/recipes/${recipe.id}/edit$`));
    expect(saves).toHaveLength(0);
    expect((await getRecipe(request, recipe.id)).ingredients).toHaveLength(2);
  });

  test('after an ingredient is added the message goes away and the recipe is saved', async ({ page }) => {
    const title = uniqueTitle('QA Water');
    await fillNewRecipe(page, title);
    await page.getByRole('button', { name: 'Remove ingredient 1' }).click();
    await page.getByRole('button', { name: 'Save recipe' }).click();
    await expect(message(page)).toBeVisible();

    await page.getByRole('button', { name: 'Add ingredient' }).click();
    await page.getByRole('textbox', { name: 'Name of ingredient 1' }).fill('water');
    await page.getByRole('button', { name: 'Save recipe' }).click();

    await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
    await expect(page.getByTestId('ingredient')).toHaveText(['1 water']);
  });

  test('a recipe with one ingredient is saved without any message', async ({ page }) => {
    const title = uniqueTitle('QA Toast');
    await fillNewRecipe(page, title);
    await page.getByRole('textbox', { name: 'Name of ingredient 1' }).fill('bread');

    await page.getByRole('button', { name: 'Save recipe' }).click();

    await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
    await expect(message(page)).toHaveCount(0);
  });
});
