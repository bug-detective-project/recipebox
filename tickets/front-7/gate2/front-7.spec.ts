import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import { createPublished, getRecipe, openRecipe } from '../../../support/app.ts';

const NAMES = ['1 star', '2 stars', '3 stars', '4 stars', '5 stars'];

/** The control of a star: a button, or a radio button of a group of five. */
function star(page: Page, name: string): Locator {
  return page.getByRole('radio', { name, exact: true }).or(page.getByRole('button', { name, exact: true }));
}

const isFocused = (locator: Locator) => locator.evaluate((element) => element === document.activeElement);

test.describe('Ticket front-7: the rating stars work with the keyboard', () => {
  test('each star is a control with a name a screen reader can say', async ({ page, request }) => {
    const recipe = await createPublished(request);
    await openRecipe(page, recipe.id, recipe.title);

    for (const name of NAMES) {
      await expect(star(page, name), `the control named "${name}"`).toHaveCount(1);
      await expect(star(page, name)).toBeEnabled();
    }
  });

  test('Tab reaches the stars', async ({ page, request }) => {
    const recipe = await createPublished(request);
    await openRecipe(page, recipe.id, recipe.title);
    await expect(star(page, '1 star')).toHaveCount(1);

    let reached = false;
    for (let presses = 0; presses < 40 && !reached; presses += 1) {
      await page.keyboard.press('Tab');
      for (const name of NAMES) {
        reached ||= await isFocused(star(page, name));
      }
    }

    expect(reached, 'a star got the focus within 40 presses of Tab').toBe(true);
  });

  test('Space on the focused star sends that rating', async ({ page, request }) => {
    const recipe = await createPublished(request);
    await openRecipe(page, recipe.id, recipe.title);

    await star(page, '4 stars').focus();
    await expect(star(page, '4 stars')).toBeFocused();
    await page.keyboard.press('Space');

    await expect(page.getByTestId('rating-summary')).toContainText('4.0 (1 rating)');
    expect((await getRecipe(request, recipe.id)).rating).toEqual({ average: 4, count: 1 });
  });

  test('another star gives another rating', async ({ page, request }) => {
    const recipe = await createPublished(request);
    await openRecipe(page, recipe.id, recipe.title);

    await star(page, '2 stars').focus();
    await page.keyboard.press('Space');

    await expect(page.getByTestId('rating-summary')).toContainText('2.0 (1 rating)');
    expect((await getRecipe(request, recipe.id)).rating).toEqual({ average: 2, count: 1 });
  });

  test('the focused star can be seen', async ({ page, request }) => {
    const recipe = await createPublished(request);
    await openRecipe(page, recipe.id, recipe.title);

    // Reached with the keyboard, so the browser shows the focus ring.
    await page.getByRole('button', { name: 'More servings' }).focus();
    let onStar = false;
    for (let presses = 0; presses < 20 && !onStar; presses += 1) {
      await page.keyboard.press('Tab');
      for (const name of NAMES) {
        onStar ||= await isFocused(star(page, name));
      }
    }
    expect(onStar).toBe(true);

    const outline = await page.evaluate(() => {
      const style = getComputedStyle(document.activeElement!);
      const labelStyle = document.activeElement!.closest('label') ? getComputedStyle(document.activeElement!.closest('label')!) : undefined;
      const visible = (s: CSSStyleDeclaration) => (s.outlineStyle !== 'none' && Number.parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none';
      return visible(style) || (labelStyle !== undefined && visible(labelStyle));
    });
    expect(outline, 'the focused star shows an outline or a ring').toBe(true);
  });

  test('a click with the mouse still rates', async ({ page, request }) => {
    const recipe = await createPublished(request);
    await openRecipe(page, recipe.id, recipe.title);

    await star(page, '5 stars').click();

    await expect(page.getByTestId('rating-summary')).toContainText('5.0 (1 rating)');
  });
});
