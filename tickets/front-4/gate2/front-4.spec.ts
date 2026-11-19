import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { cardOf, createPublished, openList, uniqueTitle } from '../../../support/app.ts';

/** From the list, without ever reloading the page: opens the recipe and its edit form. */
async function openEditFromTheList(page: Page, title: string): Promise<void> {
  await openList(page);
  await cardOf(page, title).getByRole('link', { name: title }).click();
  await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
  await page.getByRole('link', { name: 'Edit' }).click();
  await expect(page.getByRole('textbox', { name: 'Title' })).toHaveValue(title);
}

async function saveAndGoBackToTheList(page: Page, title: string): Promise<void> {
  await page.getByRole('button', { name: 'Save recipe' }).click();
  await expect(page.getByRole('heading', { name: title, level: 1 })).toBeVisible();
  await page.getByRole('link', { name: 'All recipes' }).click();
  await expect(page.getByTestId('recipe-count')).toBeVisible();
}

test.describe('Ticket front-4: the list shows a recipe as it was saved', () => {
  test('the new title is in the list right after the save, without a reload', async ({ page, request }) => {
    const recipe = await createPublished(request, { title: uniqueTitle('QA Before') });
    const renamed = uniqueTitle('QA After');
    await openEditFromTheList(page, recipe.title);

    await page.getByRole('textbox', { name: 'Title' }).fill(renamed);
    await saveAndGoBackToTheList(page, renamed);

    await expect(cardOf(page, renamed)).toBeVisible();
    await expect(cardOf(page, recipe.title)).toHaveCount(0);
  });

  test('the new time, category and description are in the list too', async ({ page, request }) => {
    const recipe = await createPublished(request, { title: uniqueTitle('QA Stew'), prepTime: '30 min', category: 'main' });
    await openEditFromTheList(page, recipe.title);

    await page.getByRole('combobox', { name: 'Hours' }).selectOption('2');
    await page.getByRole('combobox', { name: 'Minutes' }).selectOption('10');
    await page.getByRole('combobox', { name: 'Category' }).selectOption('snack');
    await page.getByRole('textbox', { name: 'Description' }).fill('Edited by the QA suite.');
    await saveAndGoBackToTheList(page, recipe.title);

    await expect(cardOf(page, recipe.title)).toContainText('Snack · 2h10');
    await expect(cardOf(page, recipe.title)).toContainText('Edited by the QA suite.');
  });

  test('a search made before the edit shows the new title too', async ({ page, request }) => {
    const recipe = await createPublished(request, { title: uniqueTitle('QA Findme') });
    const renamed = recipe.title.replace('Findme', 'Findme Again');
    await openList(page, '?q=findme');
    await expect(cardOf(page, recipe.title)).toBeVisible();
    await cardOf(page, recipe.title).getByRole('link', { name: recipe.title }).click();
    await page.getByRole('link', { name: 'Edit' }).click();
    await expect(page.getByRole('textbox', { name: 'Title' })).toHaveValue(recipe.title);

    await page.getByRole('textbox', { name: 'Title' }).fill(renamed);
    await page.getByRole('button', { name: 'Save recipe' }).click();
    await expect(page.getByRole('heading', { name: renamed, level: 1 })).toBeVisible();
    await page.goBack();
    await page.goBack();
    await page.goBack();

    await expect(page.getByRole('searchbox', { name: 'Search' })).toHaveValue('findme');
    await expect(cardOf(page, renamed)).toBeVisible();
  });

  test('the page of the recipe shows the saved recipe', async ({ page, request }) => {
    const recipe = await createPublished(request, { title: uniqueTitle('QA Page') });
    await openEditFromTheList(page, recipe.title);

    await page.getByRole('textbox', { name: 'Description' }).fill('Fresh from the form.');
    await page.getByRole('button', { name: 'Save recipe' }).click();

    await expect(page.getByRole('heading', { name: recipe.title, level: 1 })).toBeVisible();
    await expect(page.getByText('Fresh from the form.')).toBeVisible();
  });
});
