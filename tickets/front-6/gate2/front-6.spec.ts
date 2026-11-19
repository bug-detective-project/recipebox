import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';
import { boxOf, createPublished, openRecipe, SAMPLE, settle } from '../../../support/app.ts';

const LONG_STEP =
  'Rub the cold butter into the flour with the tips of your fingers until it looks like breadcrumbs, then add the water a spoon at a time, bring the dough together without kneading it and leave it wrapped in the fridge for at least thirty minutes.';

/** Every step is inside the screen, side to side, and nothing of the list is cut off. */
async function expectStepsFit(page: Page, width: number): Promise<void> {
  await settle(page);
  const steps = page.getByTestId('step');
  const count = await steps.count();
  expect(count).toBeGreaterThan(0);
  for (let index = 0; index < count; index += 1) {
    const box = await boxOf(steps.nth(index), `step ${index + 1}`);
    expect(box.x, `left edge of step ${index + 1}`).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width, `right edge of step ${index + 1} on a ${width}px screen`).toBeLessThanOrEqual(width + 0.5);
    // Text that does not wrap overflows its own box even when the box fits.
    const overflow = await steps.nth(index).evaluate((element) => element.scrollWidth - element.clientWidth);
    expect(overflow, `text of step ${index + 1} running out of its box`).toBeLessThanOrEqual(1);
  }
  const list = page.getByTestId('steps');
  expect(await list.evaluate((element) => element.scrollWidth - element.clientWidth), 'steps cut off or scrolling sideways').toBeLessThanOrEqual(1);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth), 'the page scrolling sideways').toBeLessThanOrEqual(1);
}

test.describe('Ticket front-6: the steps of a recipe can be read on a phone', () => {
  // 375px is the narrowest phone the cookbook supports.
  for (const width of [375]) {
    test(`on a ${width}px screen every step is whole inside the screen`, async ({ page }) => {
      await page.setViewportSize({ width, height: 720 });
      await openRecipe(page, SAMPLE.lemonTart, 'Lemon Tart');

      await expectStepsFit(page, width);
    });
  }

  test('a very long step wraps into more lines instead of leaving the screen', async ({ page, request }) => {
    const recipe = await createPublished(request, { steps: [LONG_STEP, 'Bake.'] });
    await page.setViewportSize({ width: 375, height: 720 });
    await openRecipe(page, recipe.id, recipe.title);

    await expectStepsFit(page, 375);
    const long = await boxOf(page.getByTestId('step').first(), 'the long step');
    const short = await boxOf(page.getByTestId('step').last(), 'the short step');
    expect(long.height, 'the long step takes several lines').toBeGreaterThan(short.height * 3);
  });

  test('the text of a step keeps a size that can be read', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 720 });
    await openRecipe(page, SAMPLE.lemonTart, 'Lemon Tart');

    const size = await page.getByTestId('step').first().evaluate((element) => Number.parseFloat(getComputedStyle(element).fontSize));
    expect(size).toBeGreaterThanOrEqual(14);
  });

  test('the number of a step stays next to its text', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 720 });
    await openRecipe(page, SAMPLE.lemonTart, 'Lemon Tart');

    const item = page.getByTestId('steps').getByRole('listitem').first();
    const itemBox = await boxOf(item, 'the first step with its number');
    const textBox = await boxOf(item.getByTestId('step'), 'the text of the first step');
    expect(textBox.x - itemBox.x, 'room for the number on the left of the text').toBeGreaterThanOrEqual(24);
    expect(textBox.width, 'the text uses most of the width').toBeGreaterThan(220);
  });

  test('on a wide screen the steps are still whole', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await openRecipe(page, SAMPLE.lemonTart, 'Lemon Tart');

    await expectStepsFit(page, 1280);
    await expect(page.getByTestId('step')).toHaveCount(4);
  });
});
