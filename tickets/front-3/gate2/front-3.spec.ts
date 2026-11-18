import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { openList, titlesShown } from '../../../support/app.ts';

const search = (page: Page) => page.getByRole('searchbox', { name: 'Search' });
const param = (page: Page, name: string) => new URL(page.url()).searchParams.get(name);

test.describe('Ticket front-3: the filters of the list live in the URL', () => {
  test('the search is written in the URL while the cook types', async ({ page }) => {
    await openList(page);

    await search(page).fill('tart');

    await expect.poll(() => param(page, 'q')).toBe('tart');
    await expect(page.getByTestId('recipe-card')).toHaveCount(1);
    expect(await titlesShown(page)).toEqual(['Lemon Tart']);
  });

  test('the search is still there after opening a recipe and going back', async ({ page }) => {
    await openList(page);
    await search(page).fill('tart');
    await expect(page.getByTestId('recipe-card')).toHaveCount(1);

    await page.getByRole('link', { name: 'Lemon Tart' }).click();
    await expect(page.getByRole('heading', { name: 'Lemon Tart', level: 1 })).toBeVisible();
    await page.goBack();

    await expect(search(page)).toHaveValue('tart');
    await expect(page.getByTestId('recipe-card')).toHaveCount(1);
    expect(param(page, 'q')).toBe('tart');
    expect(await titlesShown(page)).toEqual(['Lemon Tart']);
  });

  test('a reload keeps the search', async ({ page }) => {
    await openList(page);
    await search(page).fill('curry');
    await expect.poll(() => param(page, 'q')).toBe('curry');

    await page.reload();

    await expect(search(page)).toHaveValue('curry');
    await expect(page.getByTestId('recipe-card')).toHaveCount(1);
    expect(await titlesShown(page)).toEqual(['Vegetable Curry']);
  });

  test('a link with filters opens the list already filtered, with the fields filled', async ({ page }) => {
    await openList(page, '?q=lemon&category=dessert');

    await expect(page.getByTestId('recipe-card')).toHaveCount(1);
    expect(await titlesShown(page)).toEqual(['Lemon Tart']);
    await expect(search(page)).toHaveValue('lemon');
    await expect(page.getByRole('combobox', { name: 'Category' })).toHaveValue('dessert');
  });

  test('the category, the ingredient and "Only favorites" are in the URL too', async ({ page }) => {
    await openList(page);

    await page.getByRole('combobox', { name: 'Category' }).selectOption('breakfast');
    await expect.poll(() => param(page, 'category')).toBe('breakfast');

    await page.getByRole('searchbox', { name: 'Ingredient' }).fill('egg');
    await expect.poll(() => param(page, 'ingredient')).toBe('egg');

    // A click, not check(): the box follows the address, which changes a moment after the click.
    await page.getByRole('checkbox', { name: 'Only favorites' }).click();
    await expect(page.getByRole('checkbox', { name: 'Only favorites' })).toBeChecked();
    await expect.poll(() => param(page, 'favorites')).toBe('true');

    await expect(page.getByTestId('recipe-card')).toHaveCount(1);
    expect(await titlesShown(page)).toEqual(['Banana Pancakes']);

    await page.reload();
    await expect(page.getByRole('checkbox', { name: 'Only favorites' })).toBeChecked();
    await expect(page.getByRole('searchbox', { name: 'Ingredient' })).toHaveValue('egg');
    await expect(page.getByTestId('recipe-card')).toHaveCount(1);
  });

  test('a filter that is cleared leaves the URL', async ({ page }) => {
    await openList(page, '?q=tart');
    await expect(page.getByTestId('recipe-card')).toHaveCount(1);

    await search(page).fill('');

    await expect.poll(() => new URL(page.url()).searchParams.has('q')).toBe(false);
    await expect(page.getByTestId('recipe-card')).toHaveCount(12);
  });
});
