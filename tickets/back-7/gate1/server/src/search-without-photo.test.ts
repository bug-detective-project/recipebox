import { describe, expect, it } from 'vitest';
import type { RecipeSummary } from './recipes.ts';
import { recipeInput, useApi } from './test/api.ts';

const api = useApi();

const search = async (query: string) => (await api.get<RecipeSummary[]>(`/api/recipes?${query}`)).body.map((recipe) => recipe.title);

describe('the search and the recipes without a photo', () => {
  it('finds a recipe without a photo by its title', async () => {
    expect(await search('q=pasta')).toEqual(['Garlic Butter Pasta']);
    expect(await search('q=toastie')).toEqual(['Cheese Toastie']);
  });

  it('finds a recipe without a photo by its description', async () => {
    expect(await search('q=weeknight')).toEqual(['Garlic Butter Pasta']);
  });

  it('lists recipes with and without a photo together', async () => {
    // "lemon" is in the title of the tart (no photo) and of the chicken (photo), and in a caption.
    expect(await search('q=lemon')).toEqual(['Lemon Tart', 'Roast Chicken with Lemon']);
  });

  it('finds a recipe that was just created without a photo', async () => {
    await api.post('/api/recipes', recipeInput({ title: 'Zucchini Fritters', photo: null }));

    expect(await search('q=zucchini')).toEqual(['Zucchini Fritters']);
  });

  it('still searches what a photo shows', async () => {
    expect(await search('q=glass jar')).toEqual(['Overnight Oats']);
  });

  it('keeps the other filters of a search', async () => {
    expect(await search('q=lemon&category=dessert')).toEqual(['Lemon Tart']);
  });
});
