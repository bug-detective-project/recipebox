import { expect, test } from '@playwright/test';
import { createPublished, openRecipe, SAMPLE } from '../../../support/app.ts';

test.describe('Ticket front-8: every ingredient has its own line, for any number of servings', () => {
  test('one more serving keeps one line per ingredient, each with its quantity', async ({ page }) => {
    await openRecipe(page, SAMPLE.pancakes, 'Banana Pancakes');
    await expect(page.getByTestId('ingredient')).toHaveText(['2 ripe banana', '2 egg', '200 g flour', '250 ml milk', '1 tbsp butter']);

    await page.getByRole('button', { name: 'More servings' }).click();

    await expect(page.getByTestId('servings')).toHaveText('5 servings');
    await expect(page.getByTestId('ingredient')).toHaveText(['2.5 ripe banana', '2.5 egg', '250 g flour', '312.5 ml milk', '1.25 tbsp butter']);
  });

  test('fewer servings keep one line per ingredient too', async ({ page }) => {
    await openRecipe(page, SAMPLE.pancakes, 'Banana Pancakes');

    await page.getByRole('button', { name: 'Fewer servings' }).click();
    await page.getByRole('button', { name: 'Fewer servings' }).click();

    await expect(page.getByTestId('servings')).toHaveText('2 servings');
    await expect(page.getByTestId('ingredient')).toHaveText(['1 ripe banana', '1 egg', '100 g flour', '125 ml milk', '0.5 tbsp butter']);
  });

  test('going up and back down shows the recipe as it was', async ({ page }) => {
    await openRecipe(page, SAMPLE.chicken, 'Roast Chicken with Lemon');
    const original = await page.getByTestId('ingredient').allTextContents();
    expect(original).toEqual(['1 whole chicken', '2 lemon', '4 clove garlic', '2 tbsp olive oil', '1 tsp salt']);

    await page.getByRole('button', { name: 'More servings' }).click();
    await page.getByRole('button', { name: 'More servings' }).click();
    await page.getByRole('button', { name: 'More servings' }).click();
    await expect(page.getByTestId('servings')).toHaveText('9 servings');
    await expect(page.getByTestId('ingredient')).toHaveText(['1.5 whole chicken', '3 lemon', '6 clove garlic', '3 tbsp olive oil', '1.5 tsp salt']);

    for (let presses = 0; presses < 3; presses += 1) {
      await page.getByRole('button', { name: 'Fewer servings' }).click();
    }
    await expect(page.getByTestId('ingredient')).toHaveText(original);
  });

  test('a recipe made now, doubled, lists each of its ingredients once', async ({ page, request }) => {
    const recipe = await createPublished(request, {
      servings: 1,
      ingredients: [
        { name: 'rice', quantity: 90, unit: 'g' },
        { name: 'water', quantity: 180, unit: 'ml' },
        { name: 'salt', quantity: 1, unit: 'pinch' },
      ],
    });
    await openRecipe(page, recipe.id, recipe.title);

    await page.getByRole('button', { name: 'More servings' }).click();

    await expect(page.getByTestId('servings')).toHaveText('2 servings');
    await expect(page.getByTestId('ingredient')).toHaveText(['180 g rice', '360 ml water', '2 pinch salt']);
  });
});
